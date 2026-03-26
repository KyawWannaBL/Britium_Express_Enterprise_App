"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
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
  const initialCenter = useMemo<[number, number]>(() => {
    if (branch.longitude != null && branch.latitude != null) return [branch.longitude, branch.latitude];
    const fallback = liveUnits.find((unit) => unit.longitude != null && unit.latitude != null);
    return fallback ? [fallback.longitude as number, fallback.latitude as number] : [96.1735, 16.8409];
  }, [branch, liveUnits]);

  useEffect(() => {
    if (!mapRef.current || !token || mapInstance.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCenter,
      zoom: 10.5
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    mapInstance.current = map;

    if (branch.longitude != null && branch.latitude != null) {
      const node = document.createElement("div");
      node.className = "map-hq-marker";
      node.innerHTML = `<span>HQ</span>`;
      new mapboxgl.Marker({ element: node })
        .setLngLat([branch.longitude, branch.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(`<strong>${branch.code ?? "Branch HQ"}</strong>`))
        .addTo(map);
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapInstance.current = null;
    };
  }, [branch, initialCenter, token]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const existing = markersRef.current;
    const liveIds = new Set(liveUnits.map((unit) => unit.id));

    existing.forEach((marker, id) => {
      if (!liveIds.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    });

    liveUnits.forEach((unit, index) => {
      if (unit.longitude == null || unit.latitude == null) return;

      const html = document.createElement("button");
      html.className = "map-driver-marker";
      html.innerHTML = `<span class="map-driver-badge">${index + 1}</span><span class="map-driver-label">${unit.code}</span>`;

      const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(`
        <div class="map-popup">
          <strong>${unit.driverName}</strong><br/>
          ${unit.code} · ${unit.type}<br/>
          Status: ${unit.status}<br/>
          Speed: ${unit.speedKph ?? 0} km/h<br/>
          Last seen: ${unit.lastSeenAt ? new Date(unit.lastSeenAt).toLocaleString() : "—"}
        </div>
      `);

      const found = existing.get(unit.id);
      if (found) {
        found.setLngLat([unit.longitude, unit.latitude]);
        found.setPopup(popup);
      } else {
        const marker = new mapboxgl.Marker({ element: html })
          .setLngLat([unit.longitude, unit.latitude])
          .setPopup(popup)
          .addTo(map);
        existing.set(unit.id, marker);
      }
    });
  }, [liveUnits]);

  useEffect(() => {
    let channel: any = null;
    let supabaseClient: ReturnType<typeof createBrowserSupabaseClient> | null = null;
    try {
      supabaseClient = createBrowserSupabaseClient();
      channel = supabaseClient
        .channel(`way-live-${branch.code ?? "global"}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "vehicle_locations" },
          () => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("britium-live-refresh"));
            }
          }
        )
        .subscribe();
    } catch {
      // Environment may not be configured yet.
    }

    return () => {
      if (channel && supabaseClient) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [branch.code]);

  if (!token) {
    return (
      <div className="map-fallback">
        <strong>Mapbox token missing.</strong>
        <span>Add NEXT_PUBLIC_MAPBOX_TOKEN or VITE_MAPBOX_TOKEN to render the live dispatch map.</span>
      </div>
    );
  }

  return <div ref={mapRef} className="way-map-surface" aria-label="Live route map" />;
}
