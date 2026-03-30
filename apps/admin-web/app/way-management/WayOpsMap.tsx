"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // CRITICAL: Missing this causes the map to look broken
import { createBrowserSupabaseClient } from "../../lib/supabase-browser";

type LiveUnit = {
  id: string;
  code: string;
  driverName: string;
  type: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  lastSeenAt: string | null;
  speedKph: number | null;
};

type Branch = {
  code: string | null;
  latitude: number | null;
  longitude: number | null;
};

function readMapboxToken() {
  // Check common env variable names
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN || "";
}

export default function WayOpsMap({
  branch,
  liveUnits
}: {
  branch: Branch;
  liveUnits: LiveUnit[];
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  const token = readMapboxToken();

  // Compute center based on HQ or first available unit
  const initialCenter = useMemo<[number, number]>(() => {
    if (branch?.longitude != null && branch?.latitude != null) {
      return [Number(branch.longitude), Number(branch.latitude)];
    }
    const fallback = liveUnits.find((u) => u.longitude != null && u.latitude != null);
    return fallback 
      ? [Number(fallback.longitude), Number(fallback.latitude)] 
      : [96.1735, 16.8409]; // Default to Yangon center
  }, [branch, liveUnits]);

  // 1. Map Initialization
  useEffect(() => {
    if (!mapRef.current || !token || mapInstance.current) return;

    mapboxgl.accessToken = token;
    
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCenter,
      zoom: 11,
      pitch: 45, // Adds a nice perspective for logistics
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapInstance.current = map;

    // Add HQ Marker once
    if (branch?.longitude != null && branch?.latitude != null) {
      const hqEl = document.createElement("div");
      hqEl.className = "map-hq-marker";
      hqEl.innerHTML = `<div style="background:#0ea5e9; padding:4px 8px; border-radius:4px; color:white; font-weight:bold; border:2px solid white;">HQ</div>`;
      
      new mapboxgl.Marker({ element: hqEl })
        .setLngLat([branch.longitude, branch.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${branch.code || 'Branch HQ'}</strong>`))
        .addTo(map);
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [token]); // Only run once on token load

  // 2. Dynamic Marker Updates (Rider Positions)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const existingMarkers = markersRef.current;
    const currentUnitIds = new Set(liveUnits.map(u => u.id));

    // Remove units that are no longer active/in list
    existingMarkers.forEach((marker, id) => {
      if (!currentUnitIds.has(id)) {
        marker.remove();
        existingMarkers.delete(id);
      }
    });

    // Add or Update markers
    liveUnits.forEach((unit) => {
      if (unit.longitude == null || unit.latitude == null) return;

      const marker = existingMarkers.get(unit.id);
      const lngLat: [number, number] = [Number(unit.longitude), Number(unit.latitude)];

      if (marker) {
        // Smoothly update position if marker exists
        marker.setLngLat(lngLat);
      } else {
        // Create new marker
        const el = document.createElement("div");
        el.className = "map-driver-marker";
        el.style.cursor = "pointer";
        el.innerHTML = `
          <div style="background:#22c55e; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>
          <span style="font-size:10px; color:white; background:rgba(0,0,0,0.7); padding:2px 4px; border-radius:3px; margin-left:4px;">${unit.code}</span>
        `;

        const newMarker = new mapboxgl.Marker({ element: el })
          .setLngLat(lngLat)
          .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div style="color:#333; font-family:sans-serif;">
              <strong>${unit.driverName}</strong><br/>
              Speed: ${unit.speedKph || 0} km/h<br/>
              Status: ${unit.status}
            </div>
          `))
          .addTo(map);

        existingMarkers.set(unit.id, newMarker);
      }
    });
  }, [liveUnits]);

  // 3. Supabase Realtime Listener
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let channel: any = null;
    const supabase = createBrowserSupabaseClient();

    channel = supabase
      .channel(`live-location-${branch?.code || 'global'}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'vehicle_locations' 
      }, () => {
        window.dispatchEvent(new CustomEvent("britium-live-refresh"));
      })
      .subscribe();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [branch?.code]);

  if (!token) {
    return (
      <div style={{ padding: '40px', background: '#1e293b', color: '#94a3b8', borderRadius: '12px', textAlign: 'center' }}>
        <strong>Mapbox Token Missing</strong><br/>
        Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env file.
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden' }} />;
}