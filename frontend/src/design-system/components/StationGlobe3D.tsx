/**
 * frontend/src/design-system/components/StationGlobe3D.tsx
 * SkyGuard AI — 3D Planetary Atmospheric Digital Twin.
 * Photorealistic Three.js WGS84 projection, 3D raycast spherical geo-coordinate detection,
 * authentic WMO QC color status legend, spatial distribution for all 31 stations,
 * precision distance scale, and seamless SAT/MAP switching.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Station } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  Globe,
  ZoomIn,
  ZoomOut,
  RotateCw,
  MapPin,
  X,
  Map,
  Satellite,
  Maximize2,
  Minimize2,
  Gauge,
  Play,
  Pause,
  ChevronDown,
} from 'lucide-react';

export interface StationGlobe3DProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (stationId: string) => void;
  mapMode?: '3D' | '2D';
  onMapModeChange?: (mode: '3D' | '2D') => void;
  surfaceTexture?: 'SAT' | 'MAP';
  onSurfaceTextureChange?: (tex: 'SAT' | 'MAP') => void;
  className?: string;
}

/** Create fallback procedural canvas texture to guarantee immediate display */
function createFallbackTexture(mode: 'SAT' | 'MAP'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (mode === 'SAT') {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#091c33');
      grad.addColorStop(0.5, '#05101f');
      grad.addColorStop(1, '#091c33');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
      for (let i = 0; i < 40; i++) {
        const cx = Math.random() * canvas.width;
        const cy = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + Math.random() * 80, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += canvas.width / 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += canvas.height / 9) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export const StationGlobe3D: React.FC<StationGlobe3DProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  mapMode = '3D',
  onMapModeChange,
  surfaceTexture = 'SAT',
  onSurfaceTextureChange,
  className = '',
}) => {
  const { isDark } = useTheme();
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [localTexture, setLocalTexture] = useState<'SAT' | 'MAP'>(surfaceTexture);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [hoveredStation, setHoveredStation] = useState<any>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState<boolean>(false);
  const [isFullPage, setIsFullPage] = useState<boolean>(false);
  const [zuluTime, setZuluTime] = useState<string>('');
  const [cursorCoordinateText, setCursorCoordinateText] = useState<string>('28.61°N, 77.21°E');
  const [currentScaleKm, setCurrentScaleKm] = useState<number>(2000);
  const [scaleBarPx, setScaleBarPx] = useState<number>(72);

  const speedMenuRef = useRef<HTMLDivElement | null>(null);

  // Synchronize local texture with prop
  useEffect(() => {
    setLocalTexture(surfaceTexture);
  }, [surfaceTexture]);

  // Synchronize Three.js renderer clearColor with theme mode
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(isDark ? 0x02040a : 0xf1f5f9, 1.0);
    }
  }, [isDark]);

  // Handle speed menu click outside
  useEffect(() => {
    if (!isSpeedMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setIsSpeedMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isSpeedMenuOpen]);

  // Handle Full Page Escape Key
  useEffect(() => {
    if (!isFullPage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullPage(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullPage]);

  // Trigger Three.js resize when toggling full page
  useEffect(() => {
    const handleResizeNow = () => {
      if (mountRef.current && rendererRef.current && cameraRef.current) {
        const rect = mountRef.current.getBoundingClientRect();
        const w = rect.width || mountRef.current.clientWidth || 640;
        const h = rect.height || mountRef.current.clientHeight || 480;
        if (w > 0 && h > 0) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h, false);
        }
      }
      window.dispatchEvent(new Event('resize'));
    };

    handleResizeNow();
    const timers = [30, 80, 180, 320].map((d) => setTimeout(handleResizeNow, d));
    return () => timers.forEach(clearTimeout);
  }, [isFullPage]);

  // Zulu Clock Ticker
  useEffect(() => {
    const updateZulu = () => {
      const now = new Date();
      setZuluTime(now.toISOString().slice(11, 19) + 'Z');
    };
    updateZulu();
    const t = setInterval(updateZulu, 1000);
    return () => clearInterval(t);
  }, []);

  // Mutable refs
  const isAutoRotatingRef = useRef<boolean>(isAutoRotating);
  isAutoRotatingRef.current = isAutoRotating;

  const rotationSpeedRef = useRef<number>(rotationSpeed);
  rotationSpeedRef.current = rotationSpeed;

  const onSelectStationRef = useRef(onSelectStation);
  onSelectStationRef.current = onSelectStation;

  const stationsRef = useRef<Station[]>(stations);
  stationsRef.current = stations;

  const selectedStationIdRef = useRef<string | undefined>(selectedStationId);
  selectedStationIdRef.current = selectedStationId;

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const earthMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const satelliteTextureRef = useRef<THREE.Texture | null>(null);
  const mapTextureRef = useRef<THREE.Texture | null>(null);
  const nightTextureRef = useRef<THREE.Texture | null>(null);

  // Layer Groups
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const consensusArcsGroupRef = useRef<THREE.Group | null>(null);

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.22, y: -1.35 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.22, y: -1.35 });

  const latLonToVector3 = useCallback((lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Update Dynamic Pins & Spatial Consensus Arcs for all 31 stations
  const updateGlobePins = useCallback(() => {
    if (!pinsGroupRef.current || !consensusArcsGroupRef.current) return;

    const pinsGroup = pinsGroupRef.current;
    const arcsGroup = consensusArcsGroupRef.current;

    // Clean old objects
    while (pinsGroup.children.length > 0) {
      const c = pinsGroup.children[0] as any;
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach((m: any) => m.dispose());
        else c.material.dispose();
      }
      pinsGroup.remove(c);
    }
    while (arcsGroup.children.length > 0) {
      const c = arcsGroup.children[0] as any;
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
      arcsGroup.remove(c);
    }

    const R = 1.0;
    const coreStations = stationsRef.current;
    const currentSelectedId = selectedStationIdRef.current;
    const stationCoords: { [id: string]: THREE.Vector3 } = {};
    const coordSeenCount: { [key: string]: number } = {};

    coreStations.forEach((st) => {
      let lat = st.latitude ?? 28.6139;
      let lon = st.longitude ?? 77.2090;

      // Coordinate de-duplication offset so co-located stations (e.g. duplicates/extensions) are clearly distinct
      const coordKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
      const seen = coordSeenCount[coordKey] || 0;
      coordSeenCount[coordKey] = seen + 1;

      if (seen > 0) {
        const angle = (seen * (Math.PI * 2)) / 4;
        lat += Math.sin(angle) * 0.45;
        lon += Math.cos(angle) * 0.45;
      }

      const pos = latLonToVector3(lat, lon, R);
      stationCoords[st.station_id] = pos;

      const isSelected = st.station_id === currentSelectedId;
      const health = st.health_score ?? 98;
      const isCritical = health < 60 || st.status === 'CRITICAL';
      const isWarning = (health >= 60 && health < 85) || st.status === 'WARNING' || st.status === 'DEGRADED';

      // 4-Tier Color Matrix:
      // Cyan = Active Selected Focus
      // Red = Critical Anomaly / Multi-Tier QC Violation
      // Amber = Warning / Calibration Drift
      // Green = Nominal / WMO Certified
      const pinHex = isSelected ? 0x38bdf8 : isCritical ? 0xef4444 : isWarning ? 0xf59e0b : 0x10b981;

      // 1. Aerodynamic Glowing Pin Head
      const pinHeadGeo = new THREE.SphereGeometry(isSelected ? 0.024 : 0.016, 16, 16);
      const pinHeadMat = new THREE.MeshStandardMaterial({
        color: pinHex,
        emissive: pinHex,
        emissiveIntensity: isSelected ? 1.2 : isCritical ? 0.9 : 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const pinHeadMesh = new THREE.Mesh(pinHeadGeo, pinHeadMat);
      pinHeadMesh.position.copy(pos.clone().multiplyScalar(1.036));
      pinHeadMesh.userData = { entity: st, type: 'STATION' };
      pinsGroup.add(pinHeadMesh);

      // 2. Slender Vertical Pin Stalk
      const stemGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.034, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: pinHex, transparent: true, opacity: 0.85 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.copy(pos.clone().multiplyScalar(1.018));
      stemMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      stemMesh.userData = { entity: st, type: 'STATION' };
      pinsGroup.add(stemMesh);

      // 3. Pinpoint Ground Contact Bead
      const groundDotGeo = new THREE.SphereGeometry(0.005, 8, 8);
      const groundDotMat = new THREE.MeshBasicMaterial({ color: pinHex });
      const groundDot = new THREE.Mesh(groundDotGeo, groundDotMat);
      groundDot.position.copy(pos.clone().multiplyScalar(1.002));
      pinsGroup.add(groundDot);
    });

    // Spatial Consensus Arcs between neighboring weather stations
    const stationList = Object.entries(stationCoords);
    for (let i = 0; i < stationList.length; i++) {
      for (let j = i + 1; j < stationList.length; j++) {
        const [, p1] = stationList[i];
        const [, p2] = stationList[j];
        const dist = p1.distanceTo(p2);

        // Connect stations within spatial cross-validation radius (~750 km)
        if (dist > 0.05 && dist < 0.65) {
          const mid = p1.clone().add(p2).multiplyScalar(0.5);
          mid.normalize().multiplyScalar(R * (1.04 + dist * 0.08));

          const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
          const points = curve.getPoints(20);
          const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
          const arcMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.4,
          });
          const arcLine = new THREE.Line(arcGeo, arcMat);
          arcsGroup.add(arcLine);
        }
      }
    }
  }, [latLonToVector3]);

  // Apply Texture to Material
  const applyTexture = useCallback((texType: 'SAT' | 'MAP') => {
    if (!earthMaterialRef.current) return;
    if (texType === 'SAT') {
      const tex = satelliteTextureRef.current || createFallbackTexture('SAT');
      earthMaterialRef.current.map = tex;
      earthMaterialRef.current.roughness = 0.65;
      earthMaterialRef.current.metalness = 0.05;
      earthMaterialRef.current.needsUpdate = true;
    } else {
      const tex = mapTextureRef.current || nightTextureRef.current || createFallbackTexture('MAP');
      earthMaterialRef.current.map = tex;
      earthMaterialRef.current.roughness = 0.35;
      earthMaterialRef.current.metalness = 0.15;
      earthMaterialRef.current.needsUpdate = true;
    }
  }, []);

  // Texture Switcher Effect (SAT vs MAP)
  useEffect(() => {
    applyTexture(localTexture);
  }, [localTexture, applyTexture]);

  // Precision Geodesic Scale Calculation from camera altitude & FOV
  const updateExactScale = useCallback((cameraZ: number) => {
    const container = mountRef.current;
    const canvasHeight = container ? container.clientHeight || 520 : 520;
    // Distance from camera to closest point on Earth surface (R=1.0 = 6,371 km)
    const altitudeWorld = Math.max(0.12, cameraZ - 1.0);
    const halfFovRad = (42 / 2) * (Math.PI / 180);
    const visibleWorldHeight = 2 * altitudeWorld * Math.tan(halfFovRad);
    const kmPerPixel = (visibleWorldHeight * 6371) / canvasHeight;

    const rawKm = kmPerPixel * 80;
    let roundKm = 1000;
    if (rawKm < 80) roundKm = 50;
    else if (rawKm < 180) roundKm = 100;
    else if (rawKm < 350) roundKm = 250;
    else if (rawKm < 750) roundKm = 500;
    else if (rawKm < 1500) roundKm = 1000;
    else if (rawKm < 3200) roundKm = 2000;
    else roundKm = 4000;

    const barPixelWidth = Math.max(36, Math.min(140, Math.round(roundKm / kmPerPixel)));
    setCurrentScaleKm(roundKm);
    setScaleBarPx(barPixelWidth);
  }, []);

  // Zoom Handler with Dynamic Distance Scale Calculation
  const handleZoom = useCallback((delta: number) => {
    if (!cameraRef.current) return;
    const newZ = Math.max(1.15, Math.min(4.8, cameraRef.current.position.z + delta));
    cameraRef.current.position.z = newZ;
    updateExactScale(newZ);
  }, [updateExactScale]);

  // Main Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDestroyed = false;
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.85);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(isDark ? 0x02040a : 0xf1f5f9, 1.0);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLight.position.set(5, 3, 4);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x4080bf, 0.7);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    // Deep Space Starfield with soft circular glowing points
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 16;
    starCanvas.height = 16;
    const starCtx = starCanvas.getContext('2d');
    if (starCtx) {
      const grad = starCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.4, 'rgba(180, 210, 255, 0.7)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      starCtx.fillStyle = grad;
      starCtx.fillRect(0, 0, 16, 16);
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      // Distribute stars on a distant spherical shell strictly in the background
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 25.0 + Math.random() * 15.0;

      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = -Math.abs(r * Math.cos(phi)) - 5.0; // Strictly behind Earth
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      map: starTexture,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Atmospheric Glow
    const atmosphereGeo = new THREE.SphereGeometry(1.024, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15, side: THREE.BackSide });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Load Textures with instant update callbacks
    const textureLoader = new THREE.TextureLoader();
    
    const satTex = textureLoader.load('/assets/earth/earth_satellite.jpg', () => {
      if (earthMaterialRef.current && localTexture === 'SAT') {
        earthMaterialRef.current.needsUpdate = true;
      }
    });
    const mapTex = textureLoader.load('/assets/earth/earth_map.jpg', () => {
      if (earthMaterialRef.current && localTexture === 'MAP') {
        earthMaterialRef.current.needsUpdate = true;
      }
    });
    const nightTex = textureLoader.load('/assets/earth/earth_night.jpg');
    const bumpTex = textureLoader.load('/assets/earth/earth_topology.png');

    satelliteTextureRef.current = satTex;
    mapTextureRef.current = mapTex;
    nightTextureRef.current = nightTex;

    const initialTex = localTexture === 'SAT' ? satTex : mapTex;
    const earthGeo = new THREE.SphereGeometry(1.0, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: initialTex,
      bumpMap: bumpTex,
      bumpScale: 0.035,
      roughness: 0.65,
      metalness: 0.05,
    });
    earthMaterialRef.current = earthMat;

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMeshRef.current = earthMesh;
    globeGroup.add(earthMesh);

    // Pin & Consensus Arc Groups
    const pinsGroup = new THREE.Group();
    pinsGroupRef.current = pinsGroup;
    globeGroup.add(pinsGroup);

    const consensusGroup = new THREE.Group();
    consensusArcsGroupRef.current = consensusGroup;
    globeGroup.add(consensusGroup);

    updateGlobePins();
    updateExactScale(2.85);

    // Wheel Zoom on Canvas
    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.15 : -0.15;
      handleZoom(delta);
    };
    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    // Resize Handler with ResizeObserver
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const rect = container.getBoundingClientRect();
      const w = rect.width || container.clientWidth || 640;
      const h = rect.height || container.clientHeight || 480;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h, false);
      }
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isAutoRotatingRef.current && !isDraggingRef.current) {
        targetRotationRef.current.y -= 0.0018 * (rotationSpeedRef.current ?? 1.0);
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotationRef.current.x;
        globeGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animId);
      container.removeEventListener('wheel', handleWheelEvent);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [handleZoom, localTexture, updateGlobePins]);

  useEffect(() => {
    updateGlobePins();
  }, [stations, selectedStationId, updateGlobePins]);

  // Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container) return;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;
      targetRotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Accurate 3D Raycasting for Latitude and Longitude
    if (cameraRef.current && earthMeshRef.current) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const earthHits = raycasterRef.current.intersectObject(earthMeshRef.current, false);

      if (earthHits.length > 0) {
        const hitPoint = earthHits[0].point.clone();
        earthMeshRef.current.worldToLocal(hitPoint);
        hitPoint.normalize();

        // Authentic WGS84 Spherical Trigonometry
        const latDeg = Math.asin(Math.max(-1, Math.min(1, hitPoint.y))) * (180 / Math.PI);
        let lonDeg = (Math.atan2(hitPoint.z, -hitPoint.x) * 180 / Math.PI) - 180;
        while (lonDeg < -180) lonDeg += 360;
        while (lonDeg > 180) lonDeg -= 360;

        const latDir = latDeg >= 0 ? 'N' : 'S';
        const lonDir = lonDeg >= 0 ? 'E' : 'W';
        setCursorCoordinateText(`${Math.abs(latDeg).toFixed(2)}°${latDir}, ${Math.abs(lonDeg).toFixed(2)}°${lonDir}`);
      }
    }

    // Hover detection over station pins
    if (cameraRef.current && pinsGroupRef.current) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);

      if (intersects.length > 0) {
        let rootObj: any = intersects[0].object;
        while (rootObj && !rootObj.userData?.entity && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.userData?.entity) {
          setHoveredStation(rootObj.userData.entity);
          setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          container.style.cursor = 'pointer';
          return;
        }
      }
    }
    setHoveredStation(null);
    container.style.cursor = 'grab';
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !pinsGroupRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(pinsGroupRef.current.children, true);

    if (intersects.length > 0) {
      let rootObj: any = intersects[0].object;
      while (rootObj && !rootObj.userData?.entity && rootObj.parent) {
        rootObj = rootObj.parent;
      }
      if (rootObj && rootObj.userData?.entity) {
        const ent = rootObj.userData.entity;
        setSelectedEntity(ent);
        if (onSelectStationRef.current && ent.station_id) {
          onSelectStationRef.current(ent.station_id);
        }
      }
    }
  };

  const handleTextureSwitch = (tex: 'SAT' | 'MAP') => {
    setLocalTexture(tex);
    applyTexture(tex);
    if (onSurfaceTextureChange) onSurfaceTextureChange(tex);
  };

  return (
    <div
      className={
        isFullPage
          ? `fixed inset-0 z-50 w-screen h-screen overflow-hidden select-none font-sans animate-fadeIn ${
              isDark ? 'bg-[#02040a]' : 'bg-[#f8fafc]'
            }`
          : `relative w-full h-[520px] rounded-2xl overflow-hidden select-none transition-all ${
              isDark
                ? 'bg-[#02040a] border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.9)]'
                : 'bg-[#f8fafc] border border-slate-200 shadow-sm'
            } ${className}`
      }
    >
      {/* ─── TOP STATUS HUD (Frosted Glass Translucent Pill) ──────────────── */}
      <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        <div
          className={`flex items-center gap-3 backdrop-blur-md px-3.5 py-1.5 rounded-xl pointer-events-auto transition-all ${
            isDark
              ? 'bg-[#060914]/90 border border-white/[0.08] shadow-lg text-slate-200'
              : 'bg-white/90 border border-slate-200 shadow-sm text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className={`text-xs font-black font-mono tracking-widest uppercase ${
                isDark ? 'text-amber-300' : 'text-amber-700'
              }`}
            >
              SYNOPTIC OBSERVATION GRID
            </span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            ZULU {zuluTime || 'LIVE'}
          </span>
          <span
            className={`text-[10px] font-mono font-bold ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}
          >
            STATUS: LIVE
          </span>
          <span
            className={`text-[10px] font-mono hidden sm:inline ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
            title="Total registered synoptic automatic weather stations in network"
          >
            NODES:{' '}
            <strong className={isDark ? 'text-white' : 'text-slate-900'}>
              {stations.length} SYNOPTIC AWS
            </strong>
          </span>
        </div>

        {/* Right Controls */}
        <div
          className={`flex items-center gap-1.5 backdrop-blur-md p-1 rounded-xl pointer-events-auto transition-all ${
            isDark
              ? 'bg-[#060914]/90 border border-white/[0.08] shadow-lg'
              : 'bg-white/90 border border-slate-200 shadow-sm'
          }`}
        >
          {/* Rotation Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              isAutoRotating
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={isAutoRotating ? 'Pause Orbit (Space)' : 'Start Planetary Orbit (Space)'}
          >
            {isAutoRotating ? (
              <RotateCw size={13} className="animate-spin" />
            ) : (
              <Play size={13} />
            )}
          </button>

          {/* Speed Selector Dropdown */}
          <div className="relative" ref={speedMenuRef}>
            <button
              onClick={() => setIsSpeedMenuOpen((prev) => !prev)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                rotationSpeed !== 1.0
                  ? isDark
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
              title="Adjust Planetary Orbit Speed"
            >
              <Gauge size={12} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
              <span>{rotationSpeed > 0 ? `${rotationSpeed}x` : `${Math.abs(rotationSpeed)}x ⇄`}</span>
              <ChevronDown size={10} className={`text-slate-400 transition-transform duration-150 ${isSpeedMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSpeedMenuOpen && (
              <div
                className={`absolute top-full right-0 mt-1.5 w-48 backdrop-blur-xl rounded-xl p-2.5 shadow-2xl z-50 font-mono text-xs space-y-2.5 animate-fadeIn border ${
                  isDark
                    ? 'bg-[#080c18]/98 border-amber-500/40 text-slate-300'
                    : 'bg-white/98 border-slate-300 text-slate-800'
                }`}
              >
                <div className={`flex items-center justify-between text-[10px] pb-1.5 border-b ${isDark ? 'text-slate-400 border-white/[0.08]' : 'text-slate-500 border-slate-100'}`}>
                  <span className={`font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                    <Gauge size={11} className={isDark ? 'text-amber-400' : 'text-amber-600'} /> Orbit Velocity
                  </span>
                  <span className={`font-bold px-1.5 py-0.5 rounded border ${isDark ? 'bg-amber-500/20 text-white border-amber-500/30' : 'bg-amber-50 text-amber-900 border-amber-200'}`}>
                    {rotationSpeed > 0 ? `${rotationSpeed}x` : `${Math.abs(rotationSpeed)}x (Rev)`}
                  </span>
                </div>

                {/* Speed Presets */}
                <div className="space-y-1">
                  <span className={`text-[9px] uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Presets</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[0.25, 0.5, 1.0, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          setRotationSpeed(spd);
                          setIsAutoRotating(true);
                          setIsSpeedMenuOpen(false);
                        }}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          rotationSpeed === spd
                            ? isDark
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-400/60 shadow-inner'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                            : isDark
                            ? 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.04]'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    {[3.0, 5.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          setRotationSpeed(spd);
                          setIsAutoRotating(true);
                          setIsSpeedMenuOpen(false);
                        }}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          rotationSpeed === spd
                            ? isDark
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-400/60 shadow-inner'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                            : isDark
                            ? 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.04]'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setRotationSpeed((prev) => -prev);
                        setIsAutoRotating(true);
                        setIsSpeedMenuOpen(false);
                      }}
                      className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer border ${
                        isDark
                          ? 'bg-white/[0.04] text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border-amber-500/20'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
                      }`}
                      title="Reverse Orbit Direction"
                    >
                      ⇄ Rev
                    </button>
                  </div>
                </div>

                {/* Continuous Range Slider */}
                <div className={`pt-1.5 border-t space-y-1 ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
                  <div className={`flex justify-between text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>0.1x (Slow)</span>
                    <span>5.0x (Hyper)</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={Math.abs(rotationSpeed)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setRotationSpeed(rotationSpeed < 0 ? -val : val);
                      setIsAutoRotating(true);
                    }}
                    className={`w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg appearance-none ${
                      isDark ? 'bg-slate-800' : 'bg-slate-200'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={`w-[1px] h-3.5 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* Zoom In / Out */}
          <button
            onClick={() => handleZoom(-0.3)}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Zoom In (+)"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => handleZoom(0.3)}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Zoom Out (-)"
          >
            <ZoomOut size={13} />
          </button>
          <div className={`w-[1px] h-3.5 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <button
            onClick={() => setIsFullPage((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              isFullPage
                ? isDark
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={isFullPage ? 'Exit Full Page (Esc)' : 'View Full Page'}
          >
            {isFullPage ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* ─── THREE.JS 3D CANVAS ────────────────────────────────────────────── */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      />

      {/* ─── BOTTOM-LEFT TOOLBAR & DYNAMIC SCALE (Frosted Glass Pill) ────── */}
      <div className="absolute bottom-9 left-4 z-30 pointer-events-auto flex flex-col gap-1.5">
        <div
          className={`flex items-center rounded-xl p-1 font-mono text-xs font-bold backdrop-blur-md transition-all ${
            isDark
              ? 'bg-[#070a12]/95 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-slate-300'
              : 'bg-white/90 border border-slate-300 shadow-sm text-slate-800'
          }`}
        >
          {/* 3D Button */}
          <button
            onClick={() => onMapModeChange && onMapModeChange('3D')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              mapMode === '3D'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span>3D</span>
          </button>

          {/* 2D Button */}
          <button
            onClick={() => onMapModeChange && onMapModeChange('2D')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              mapMode === '2D'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span>2D</span>
          </button>

          <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-amber-500/30' : 'bg-slate-300'}`} />

          {/* MAP Mode (Topographical / Vector Grid) */}
          <button
            onClick={() => handleTextureSwitch('MAP')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              localTexture === 'MAP'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span>MAP</span>
          </button>

          {/* SAT Mode (Blue Marble Satellite) */}
          <button
            onClick={() => handleTextureSwitch('SAT')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              localTexture === 'SAT'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Satellite size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span>SAT</span>
          </button>
        </div>

        {/* Dynamic Distance Scale Bar with calibrated physical width & ticks */}
        <div
          className={`flex items-center gap-2 text-[10px] font-mono px-2 backdrop-blur-sm rounded-md py-0.5 w-fit border transition-all ${
            isDark
              ? 'bg-[#060914]/90 border-white/[0.08] text-amber-400/90 shadow-md'
              : 'bg-white/90 border-slate-200 text-slate-700 shadow-xs'
          }`}
        >
          <div
            style={{ width: `${scaleBarPx}px` }}
            className={`h-[3px] relative border-l-2 border-r-2 ${
              isDark
                ? 'bg-amber-500/80 border-amber-300'
                : 'bg-amber-600 border-amber-700'
            }`}
          >
            <span
              className={`absolute -top-1 left-1/2 -translate-x-1/2 w-[1px] h-[5px] ${
                isDark ? 'bg-amber-400/50' : 'bg-amber-700/50'
              }`}
            />
          </div>
          <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
            {currentScaleKm.toLocaleString()} km
          </span>
        </div>
      </div>

      {/* ─── HOVER TOOLTIP HUD ────────────────────────────────────────────── */}
      {hoveredStation && (
        <div
          style={{ left: hoverPos.x + 12, top: hoverPos.y - 12 }}
          className={`absolute z-30 pointer-events-none backdrop-blur-md border rounded-xl p-2.5 text-xs font-mono shadow-xl space-y-1 animate-fadeIn transition-all ${
            isDark
              ? 'bg-[#090d18]/95 border-white/[0.15] text-slate-200'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{hoveredStation.name}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
              isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {hoveredStation.station_id}
            </span>
          </div>
          <div className={`text-[10px] flex items-center justify-between gap-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>{hoveredStation.country || 'Synoptic Node'}</span>
            <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>
              Health: {typeof hoveredStation.health_score === 'number' ? `${hoveredStation.health_score.toFixed(1)}%` : '--'}
            </span>
          </div>
        </div>
      )}

      {/* ─── SELECTED ENTITY DOSSIER INSPECTOR (Right Slide-In) ────────── */}
      {selectedEntity && (
        <div
          className={`absolute top-14 right-4 z-30 w-72 rounded-2xl p-4 text-xs font-mono backdrop-blur-xl border space-y-3 animate-slideLeft transition-all ${
            isDark
              ? 'bg-[#080b16]/95 border-white/[0.12] shadow-2xl text-slate-200'
              : 'bg-white/95 border-slate-200 shadow-xl text-slate-800'
          }`}
        >
          <div className={`flex items-start justify-between pb-2 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-100'}`}>
            <div>
              <span className={`text-[10px] uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Synoptic Telemetry Dossier
              </span>
              <h4 className={`text-sm font-bold leading-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedEntity.name}
              </h4>
              <span className={`text-[10px] font-bold block ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                {selectedEntity.station_id}
              </span>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className={`p-1 rounded-lg cursor-pointer transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Temperature</span>
              <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedEntity.temperature ?? 24.5} °C
              </span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Humidity</span>
              <span className={`font-bold text-xs ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
                {selectedEntity.humidity ?? 58} %
              </span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Barometric P</span>
              <span className={`font-bold text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                {selectedEntity.pressure ?? 1012.3} hPa
              </span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>QC Status</span>
              <span className={`font-bold text-xs uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                {selectedEntity.status || 'NOMINAL'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectStationRef.current && selectedEntity.station_id) {
                onSelectStationRef.current(selectedEntity.station_id);
              }
            }}
            className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold rounded-xl text-center shadow-md transition-all cursor-pointer"
          >
            Target Live Waveform
          </button>
        </div>
      )}

      {/* ─── BOTTOM STATUS TICKER & EXPLICIT COLOR SYSTEM LEGEND ─────────── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 backdrop-blur-md px-4 py-1.5 flex items-center justify-between text-[10px] font-mono transition-all ${
          isDark
            ? 'bg-[#04060c]/95 border-t border-amber-500/20 text-slate-400'
            : 'bg-white/90 border-t border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
            CURSOR: {cursorCoordinateText}
          </span>
          <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
          <span className={`flex items-center gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>GREEN:</strong> Nominal (Health ≥85%)
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <strong className={isDark ? 'text-amber-400' : 'text-amber-700'}>AMBER:</strong> Warning / Drift
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <strong className={isDark ? 'text-rose-400' : 'text-rose-700'}>RED:</strong> Critical Anomaly
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <strong className={isDark ? 'text-sky-400' : 'text-sky-700'}>CYAN:</strong> Active Focus Node
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
