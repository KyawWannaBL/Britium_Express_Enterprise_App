"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, MapPinned, Route, Download, Save, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { envList, tryPostCandidates, formatMMK } from "@/lib/ops-api";
import { WayPlanStop, parseWayPlanWorkbook, regroupStops, geocodeStops, moveStopInGroup, downloadManifestWorkbook } from "@/lib/way-plan-utils";

const WAYPLAN_SAVE_ENDPOINTS = envList("NEXT_PUBLIC_WAYPLAN_SAVE_ENDPOINTS", [
  "/api/v1/way-plans",
  "/api/way-plans",
]);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function WayPlanManagementPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [stops, setStops] = useState<WayPlanStop[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [groupBy, setGroupBy] = useState<"township" | "rider" | "car" | "payment">("township");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [planName, setPlanName] = useState("Daily Way Plan");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [routeMode, setRouteMode] = useState<"closed_loop" | "open_route">("closed_loop");

  const routeGroups = useMemo(() => {
    return Array.from(new Set(stops.map((s) => s.routeGroup))).sort();
  }, [stops]);

  const visibleStops = useMemo(() => {
    if (!selectedGroup) return stops;
    return stops
      .filter((s) => s.routeGroup === selectedGroup)
      .sort((a, b) => a.sequenceNo - b.sequenceNo);
  }, [stops, selectedGroup]);

  const stats = useMemo(() => {
    const geocoded = stops.filter((s) => s.latitude && s.longitude).length;
    return {
      totalStops: stops.length,
      groups: routeGroups.length,
      geocoded,
      totalCollectable: stops.reduce((sum, s) => sum + s.total, 0),
    };
  }, [stops, routeGroups]);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setBusy("upload");
    setError("");
    setMessage("");

    try {
      const parsed = await parseWayPlanWorkbook(file);
      setStops(parsed);
      setSelectedGroup(parsed[0]?.routeGroup || "");
      setMessage("Way plan source file parsed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse workbook.");
    } finally {
      setBusy("");
    }
  }

  async function handleGeocode() {
    if (!MAPBOX_TOKEN) {
      setError("NEXT_PUBLIC_MAPBOX_TOKEN is missing.");
      return;
    }
    setBusy("geocode");
    setError("");
    setMessage("");

    try {
      const next = await geocodeStops(stops, MAPBOX_TOKEN);
      setStops(next);
      setMessage("Geocoding completed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Geocoding failed.");
    } finally {
      setBusy("");
    }
  }

  function handleRegroup() {
    const next = regroupStops(stops, groupBy);
    setStops(next);
    setSelectedGroup(next[0]?.routeGroup || "");
  }

  async function handleSave() {
    setBusy("save");
    setError("");
    setMessage("");

    try {
      const payload = {
        plan_name: planName,
        plan_date: planDate,
        route_mode: routeMode,
        groups: routeGroups,
        stops: stops.map((s) => ({
          way_id: s.wayId,
          recipient_name: s.recipientName,
          township: s.township,
          address: s.address,
          phone_1: s.phone1,
          phone_2: s.phone2,
          payment_type: s.paymentType,
          weight_kg: s.weightKg,
          item_price: s.itemPrice,
          delivery_charge: s.deliveryCharge,
          weight_charge: s.weightCharge,
          total: s.total,
          rider_name: s.riderName,
          driver_name: s.driverName,
          helper_name: s.helperName,
          car_no: s.carNo,
          remark: s.remark,
          latitude: s.latitude,
          longitude: s.longitude,
          route_group: s.routeGroup,
          sequence_no: s.sequenceNo,
        })),
      };

      const result = await tryPostCandidates<{ id?: string }>(WAYPLAN_SAVE_ENDPOINTS, payload);
      setMessage(result?.id ? `Way plan saved. ID: ${result.id}` : "Way plan saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Way plan save failed.");
    } finally {
      setBusy("");
    }
  }

  useEffect(() => {
    let disposed = false;
    let map: any = null;

    async function renderMap() {
      if (!mapRef.current || !MAPBOX_TOKEN) return;

      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const points = visibleStops.filter((s) => s.latitude && s.longitude);
      const center =
        points.length > 0
          ? [points[0].longitude as number, points[0].latitude as number]
          : [96.1735, 16.8409];

      map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: center as [number, number],
        zoom: points.length > 0 ? 10 : 7,
      });

      map.on("load", () => {
        if (disposed) return;

        points.forEach((stop) => {
          new mapboxgl.Marker()
            .setLngLat([stop.longitude as number, stop.latitude as number])
            .setPopup(
              new mapboxgl.Popup({ offset: 20 }).setHTML(
                `<strong>${stop.sequenceNo}. ${stop.wayId}</strong><br/>${stop.recipientName}<br/>${stop.township}`
              )
            )
            .addTo(map);
        });

        if (points.length > 1) {
          const line = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: points.map((p) => [p.longitude, p.latitude]),
            },
            properties: {},
          };

          map.addSource("route-line", {
            type: "geojson",
            data: line as any,
          });

          map.addLayer({
            id: "route-line-layer",
            type: "line",
            source: "route-line",
            paint: {
              "line-color": "#0d2c54",
              "line-width": 4,
            },
          });
        }
      });
    }

    renderMap();

    return () => {
      disposed = true;
      if (map) map.remove();
    };
  }, [visibleStops]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Logistics</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
          Way Plan Management <span className="font-normal">/ လမ်းကြောင်းအစီအစဉ်စီမံခန့်ခွဲမှု</span>
        </h1>
        <p className="text-slate-500">
          Upload daily way list, group stops, geocode addresses, preview routes on Mapbox, resequence stops, and save or export manifests.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 whitespace-pre-line">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">Plan Controls</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Plan name"
            />
            <input
              type="date"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <option value="township">Group by Township</option>
              <option value="rider">Group by Rider</option>
              <option value="car">Group by Car</option>
              <option value="payment">Group by Payment</option>
            </select>
            <select
              value={routeMode}
              onChange={(e) => setRouteMode(e.target.value as any)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <option value="closed_loop">Closed Loop</option>
              <option value="open_route">Open Route</option>
            </select>
          </div>

          <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-3 text-slate-600">
              <Upload size={18} />
              <span className="font-bold">Upload Daily Way List (.xlsx / .csv)</span>
            </div>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="mt-4 block w-full text-sm"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={handleRegroup} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-[#0d2c54]">
              <Route size={14} />
              Auto Group
            </button>

            <button onClick={handleGeocode} disabled={!stops.length || busy === "geocode"} className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-50">
              <MapPinned size={14} />
              {busy === "geocode" ? "Geocoding..." : "Geocode Stops"}
            </button>

            <button onClick={handleSave} disabled={!stops.length || busy === "save"} className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd700] px-4 py-3 text-xs font-black uppercase tracking-wider text-[#0d2c54] disabled:opacity-50">
              <Save size={14} />
              {busy === "save" ? "Saving..." : "Save Plan"}
            </button>

            <button onClick={() => downloadManifestWorkbook(visibleStops.length ? visibleStops : stops)} disabled={!stops.length} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-[#0d2c54] disabled:opacity-50">
              <Download size={14} />
              Export Manifest
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <StatCard title="Total Stops" value={String(stats.totalStops)} />
            <StatCard title="Route Groups" value={String(stats.groups)} />
            <StatCard title="Geocoded" value={String(stats.geocoded)} />
            <StatCard title="Collectable" value={formatMMK(stats.totalCollectable)} />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0d2c54]">Map Preview</h2>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option value="">All Groups</option>
              {routeGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {!MAPBOX_TOKEN ? (
            <div className="rounded-2xl bg-rose-50 p-6 text-sm font-bold text-rose-700">
              NEXT_PUBLIC_MAPBOX_TOKEN is missing.
            </div>
          ) : (
            <div ref={mapRef} className="h-[520px] w-full rounded-2xl border border-slate-200" />
          )}
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#0d2c54]">Stops Grid</h2>
          <button
            onClick={() => {
              setStops([]);
              setError("");
              setMessage("");
              setSelectedGroup("");
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-[#0d2c54]"
          >
            <RefreshCw size={14} />
            Clear
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-black">Seq</th>
                <th className="px-4 py-3 font-black">Group</th>
                <th className="px-4 py-3 font-black">Way ID</th>
                <th className="px-4 py-3 font-black">Recipient</th>
                <th className="px-4 py-3 font-black">Township</th>
                <th className="px-4 py-3 font-black">Phone</th>
                <th className="px-4 py-3 font-black">Total</th>
                <th className="px-4 py-3 font-black">Geo</th>
                <th className="px-4 py-3 font-black">Move</th>
              </tr>
            </thead>
            <tbody>
              {visibleStops.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    No way-plan rows loaded.
                  </td>
                </tr>
              ) : (
                visibleStops
                  .sort((a, b) => a.sequenceNo - b.sequenceNo)
                  .map((stop) => (
                    <tr key={stop.id} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-3 font-black text-[#0d2c54]">{stop.sequenceNo}</td>
                      <td className="px-4 py-3">{stop.routeGroup}</td>
                      <td className="px-4 py-3 font-bold text-[#0d2c54]">{stop.wayId}</td>
                      <td className="px-4 py-3">
                        <div>{stop.recipientName}</div>
                        <div className="text-xs text-slate-400">{stop.address}</div>
                      </td>
                      <td className="px-4 py-3">{stop.township}</td>
                      <td className="px-4 py-3">{stop.phone1 || stop.phone2 || "-"}</td>
                      <td className="px-4 py-3">{formatMMK(stop.total)}</td>
                      <td className="px-4 py-3">
                        {stop.latitude && stop.longitude ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700">Mapped</span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase text-amber-700">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setStops((prev) => moveStopInGroup(prev, stop.id, "up"))} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-[#0d2c54]">
                            <ArrowUp size={14} />
                          </button>
                          <button onClick={() => setStops((prev) => moveStopInGroup(prev, stop.id, "down"))} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-[#0d2c54]">
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-3 text-4xl font-black text-[#0d2c54]">{value}</p>
    </div>
  );
}
