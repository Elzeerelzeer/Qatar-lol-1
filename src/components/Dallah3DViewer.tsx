import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCw, Coffee, Sparkles, ZoomIn, ZoomOut, Eye, Info } from 'lucide-react';
import { audioEngine } from '../services/audioService';

interface Dallah3DViewerProps {
  className?: string;
  autoRotateDefault?: boolean;
  showControls?: boolean;
  onPourCoffee?: () => void;
}

interface PartAnnotation {
  id: string;
  name: string;
  desc: string;
  pos: [number, number, number];
}

const DALLAH_PARTS: PartAnnotation[] = [
  {
    id: 'spout',
    name: 'المصب (الثعبان)',
    desc: 'الفوهة الممتدة بانحناء رشيق لصب القهوة العربية بدقة دون تناثر، ومصممة هندسياً لمنع تسرب الثفل.',
    pos: [1.8, 2.0, 0]
  },
  {
    id: 'crest',
    name: 'التاج (القرن/الهلال)',
    desc: 'القمة المدببة الأنيقة التي تعلو غطاء الدلة، مستوحاة من عمارة المآذن والقباب الإسلامية التراثية.',
    pos: [0, 3.4, 0]
  },
  {
    id: 'handle',
    name: 'المقبض (العروة)',
    desc: 'عروة نحاسية قوية مصممة للإمساك المريح باليد اليسرى لصب القهوة للضيوف حسب التقاليد القطرية.',
    pos: [-1.4, 1.4, 0]
  },
  {
    id: 'belly',
    name: 'بطن الدلة (الجرم)',
    desc: 'الجزء الأوسط العريض لحفظ حرارة القهوة الممزوجة بالهيل والزعفران، مزين بنقوش هندسية أصيلة.',
    pos: [0, 0.7, 1.1]
  },
  {
    id: 'base',
    name: 'القاعدة الدائرية',
    desc: 'قاعدة متينة متدرجة الاتساع تضمن ثبات الدلة على سجاد وفراش المجلس دون انسكاب.',
    pos: [0, -0.9, 0]
  },
  {
    id: 'finjan',
    name: 'الفنجان التراثي',
    desc: 'فنجان الخزف الصغير المخصص لاحتساء القهوة على دفعات، يُقدم باليمين ويُهز عند الاكتفاء.',
    pos: [1.6, -0.7, 0.9]
  }
];

export const Dallah3DViewer: React.FC<Dallah3DViewerProps> = ({
  className = 'w-full h-80 md:h-96',
  autoRotateDefault = true,
  showControls = true,
  onPourCoffee
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(autoRotateDefault);
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<PartAnnotation | null>(null);
  const [pourCount, setPourCount] = useState<number>(0);

  // References for animation loop
  const animFrameRef = useRef<number | null>(null);
  const dallahGroupRef = useRef<THREE.Group | null>(null);
  const coffeeStreamRef = useRef<THREE.Mesh | null>(null);
  const steamGroupRef = useRef<THREE.Group | null>(null);
  const rotationYRef = useRef<number>(0);
  const rotationXRef = useRef<number>(0.15);
  const targetRotationYRef = useRef<number>(0);
  const targetRotationXRef = useRef<number>(0.15);
  const zoomRef = useRef<number>(1);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pourProgressRef = useRef<number>(0);
  const isPouringAnimRef = useRef<boolean>(false);

  // Pour action
  const handlePour = useCallback(() => {
    if (isPouringAnimRef.current) return;
    isPouringAnimRef.current = true;
    setIsPouring(true);
    pourProgressRef.current = 0;

    audioEngine.init();
    audioEngine.playCoffeePour();

    if (onPourCoffee) {
      onPourCoffee();
    }

    setPourCount(prev => prev + 1);

    // End pour after 2.5 seconds
    setTimeout(() => {
      isPouringAnimRef.current = false;
      setIsPouring(false);
      pourProgressRef.current = 0;
      if (coffeeStreamRef.current) {
        coffeeStreamRef.current.scale.set(0, 0, 0);
      }
    }, 2600);
  }, [onPourCoffee]);

  useEffect(() => {
    const container = mountRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 350;

    // 1. Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. Lighting Setup for Golden Brass Polish
    const ambientLight = new THREE.AmbientLight(0xfff3db, 1.4);
    scene.add(ambientLight);

    // Warm Sun Key Light
    const keyLight = new THREE.DirectionalLight(0xffeaad, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Blue-tinted Fill Light (contrast)
    const fillLight = new THREE.DirectionalLight(0xb0d5ff, 0.8);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    // Golden Rim Light (for silhouette shine)
    const rimLight = new THREE.PointLight(0xffc244, 2.8, 15);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Subtle Under-Light for Warm Tray Reflection
    const underLight = new THREE.PointLight(0xd99b3b, 1.2, 8);
    underLight.position.set(0, -2, 2);
    scene.add(underLight);

    // 4. Materials
    // A) Polished Qatari Golden Brass (النحاس الذهبي المصقول)
    const brassMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E5B842'),
      metalness: 0.82,
      roughness: 0.22,
      envMapIntensity: 1.5
    });

    // B) Antique Engraved Ring Trim (نقوش وزخارف ذهبية داكنة)
    const engravedRingMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#A87920'),
      metalness: 0.90,
      roughness: 0.38
    });

    // C) Qatari Maroon Accent Enamel (المينا العنابي التراثي للزخرفة)
    const maroonEnamelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8A1538'),
      metalness: 0.45,
      roughness: 0.28
    });

    // D) Porcelain Finjan Material (خزف الفنجان الأبيض العاجي)
    const porcelainMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFBF0'),
      metalness: 0.12,
      roughness: 0.18
    });

    // E) Steaming Liquid Coffee (القهوة العربية بالهيل والزعفران)
    const coffeeLiquidMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4D2912'),
      metalness: 0.1,
      roughness: 0.1
    });

    // 5. Build Dallah 3D Assembly
    const mainDallahGroup = new THREE.Group();
    dallahGroupRef.current = mainDallahGroup;
    scene.add(mainDallahGroup);

    // Pivot group to allow realistic tilting from handle/belly when pouring
    const dallahPivot = new THREE.Group();
    dallahPivot.position.set(0, 0, 0);
    mainDallahGroup.add(dallahPivot);

    // --- Part 1: Dallah Lathe Body (البدن الرئيسي المتناسق للدلة) ---
    const profilePoints: THREE.Vector2[] = [
      new THREE.Vector2(0, -1.0),       // Base center bottom
      new THREE.Vector2(0.95, -1.0),     // Base rim
      new THREE.Vector2(1.05, -0.92),    // Base foot
      new THREE.Vector2(0.85, -0.78),    // Base waist
      new THREE.Vector2(0.92, -0.65),    // Base top ring
      new THREE.Vector2(1.15, -0.35),    // Lower belly curve
      new THREE.Vector2(1.35, 0.0),      // Belly widest point (بطن الدلة)
      new THREE.Vector2(1.22, 0.4),      // Belly upper curve
      new THREE.Vector2(0.72, 0.85),     // Waist cinch (خريطة الخصر)
      new THREE.Vector2(0.55, 1.25),     // Slender neck middle
      new THREE.Vector2(0.60, 1.7),      // Neck top flare
      new THREE.Vector2(0.82, 1.88),     // Rim lip collar (طوق الفوهة)
      new THREE.Vector2(0.65, 1.92),     // Rim interior seat for lid
      new THREE.Vector2(0.80, 2.0),      // Lid outer base
      new THREE.Vector2(0.65, 2.25),     // Lid tier 1
      new THREE.Vector2(0.48, 2.55),     // Lid tier 2
      new THREE.Vector2(0.32, 2.85),     // Lid cone
      new THREE.Vector2(0.20, 3.10),     // Spire base (قاعدة التاج)
      new THREE.Vector2(0.25, 3.25),     // Finial bulb
      new THREE.Vector2(0.12, 3.55),     // Finial tip needle
      new THREE.Vector2(0.01, 3.75),     // Crown point (قمة الهلال)
      new THREE.Vector2(0, 3.75)        // Axis top
    ];

    const bodyGeometry = new THREE.LatheGeometry(profilePoints, 48);
    const bodyMesh = new THREE.Mesh(bodyGeometry, brassMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    dallahPivot.add(bodyMesh);

    // Decorative Engraved Ribbed Bands on Belly & Neck (أطواق الزخرفة النحاسية)
    const bellyBandGeom = new THREE.TorusGeometry(1.36, 0.035, 16, 48);
    const bellyBand = new THREE.Mesh(bellyBandGeom, maroonEnamelMaterial);
    bellyBand.rotation.x = Math.PI / 2;
    bellyBand.position.y = 0.0;
    dallahPivot.add(bellyBand);

    const bellyBand2 = new THREE.Mesh(new THREE.TorusGeometry(1.24, 0.03, 16, 48), engravedRingMaterial);
    bellyBand2.rotation.x = Math.PI / 2;
    bellyBand2.position.y = 0.25;
    dallahPivot.add(bellyBand2);

    const neckBand = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.03, 16, 48), maroonEnamelMaterial);
    neckBand.rotation.x = Math.PI / 2;
    neckBand.position.y = 1.45;
    dallahPivot.add(neckBand);

    const lidBand = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.025, 16, 48), engravedRingMaterial);
    lidBand.rotation.x = Math.PI / 2;
    lidBand.position.y = 2.25;
    dallahPivot.add(lidBand);

    // --- Part 2: Traditional Curved Spout (المصب / الثعبان الأنيق) ---
    const spoutCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.9, 0.45, 0),
      new THREE.Vector3(1.3, 0.85, 0),
      new THREE.Vector3(1.75, 1.4, 0),
      new THREE.Vector3(1.95, 1.9, 0),
      new THREE.Vector3(2.1, 2.15, 0)
    ]);

    const spoutGeom = new THREE.TubeGeometry(spoutCurve, 32, 0.16, 16, false);
    const spoutMesh = new THREE.Mesh(spoutGeom, brassMaterial);
    spoutMesh.castShadow = true;
    dallahPivot.add(spoutMesh);

    // Spout Beak Tip (منقار الصب الذهبي)
    const beakGeom = new THREE.ConeGeometry(0.18, 0.35, 16, 1, true);
    const beakMesh = new THREE.Mesh(beakGeom, brassMaterial);
    beakMesh.position.set(2.15, 2.25, 0);
    beakMesh.rotation.z = -Math.PI / 3;
    dallahPivot.add(beakMesh);

    // Spout Collar Joint (حلقة تثبيت المصب بالبدن)
    const spoutCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.1, 16), engravedRingMaterial);
    spoutCollar.position.set(0.95, 0.5, 0);
    spoutCollar.rotation.z = -Math.PI / 4;
    dallahPivot.add(spoutCollar);

    // --- Part 3: Traditional Loop Handle (مقبض الدلة / العروة) ---
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.65, 1.75, 0),
      new THREE.Vector3(-1.15, 1.85, 0),
      new THREE.Vector3(-1.55, 1.5, 0),
      new THREE.Vector3(-1.65, 0.8, 0),
      new THREE.Vector3(-1.45, 0.1, 0),
      new THREE.Vector3(-1.15, -0.3, 0),
      new THREE.Vector3(-0.95, -0.4, 0)
    ]);

    const handleGeom = new THREE.TubeGeometry(handleCurve, 36, 0.09, 16, false);
    const handleMesh = new THREE.Mesh(handleGeom, brassMaterial);
    handleMesh.castShadow = true;
    dallahPivot.add(handleMesh);

    // Handle Top & Bottom Rivet Mounts (مسامير التثبيت النحاسية)
    const topMount = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), engravedRingMaterial);
    topMount.position.set(-0.7, 1.75, 0);
    dallahPivot.add(topMount);

    const bottomMount = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), engravedRingMaterial);
    bottomMount.position.set(-0.95, -0.4, 0);
    dallahPivot.add(bottomMount);

    // Handle Grip Wrap Accent in Middle (حلقات تزيين المقبض)
    const gripAccent = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 12, 24), maroonEnamelMaterial);
    gripAccent.position.set(-1.65, 0.8, 0);
    gripAccent.rotation.y = Math.PI / 2;
    dallahPivot.add(gripAccent);

    // --- Part 4: Lid Hinge & Mini Golden Chain (مفصلة الغطاء وسلسلة الأمان) ---
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 12), engravedRingMaterial);
    hinge.position.set(-0.68, 1.95, 0);
    hinge.rotation.z = Math.PI / 2;
    dallahPivot.add(hinge);

    // Tiny simulated brass chain curve from hinge to finial
    const chainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.65, 1.95, 0.05),
      new THREE.Vector3(-0.55, 2.3, 0.1),
      new THREE.Vector3(-0.35, 2.7, 0.08),
      new THREE.Vector3(-0.15, 3.1, 0.02)
    ]);
    const chainGeom = new THREE.TubeGeometry(chainCurve, 20, 0.02, 8, false);
    const chainMesh = new THREE.Mesh(chainGeom, engravedRingMaterial);
    dallahPivot.add(chainMesh);

    // --- Part 5: Companion Qatari Finjan (فنجان القهوة التراثي بجانب الدلة) ---
    const finjanGroup = new THREE.Group();
    finjanGroup.position.set(1.9, -0.75, 0.8);
    mainDallahGroup.add(finjanGroup);

    // Finjan profile points
    const finjanPoints: THREE.Vector2[] = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.24, 0),
      new THREE.Vector2(0.26, 0.05),
      new THREE.Vector2(0.38, 0.35),
      new THREE.Vector2(0.48, 0.58),
      new THREE.Vector2(0.50, 0.60),
      new THREE.Vector2(0.45, 0.60),
      new THREE.Vector2(0.36, 0.35),
      new THREE.Vector2(0.20, 0.08),
      new THREE.Vector2(0, 0.08)
    ];
    const finjanGeom = new THREE.LatheGeometry(finjanPoints, 32);
    const finjanMesh = new THREE.Mesh(finjanGeom, porcelainMaterial);
    finjanMesh.castShadow = true;
    finjanMesh.receiveShadow = true;
    finjanGroup.add(finjanMesh);

    // Finjan Golden Rim
    const finjanGoldRim = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.015, 12, 32), engravedRingMaterial);
    finjanGoldRim.rotation.x = Math.PI / 2;
    finjanGoldRim.position.y = 0.60;
    finjanGroup.add(finjanGoldRim);

    // Finjan Maroon Geometric Pattern Ring (زخرفة عنابية تراثية)
    const finjanMaroonRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.018, 12, 32), maroonEnamelMaterial);
    finjanMaroonRing.rotation.x = Math.PI / 2;
    finjanMaroonRing.position.y = 0.40;
    finjanGroup.add(finjanMaroonRing);

    // Coffee Liquid Level inside Finjan
    const coffeeInCupGeom = new THREE.CylinderGeometry(0.36, 0.30, 0.05, 32);
    const coffeeInCup = new THREE.Mesh(coffeeInCupGeom, coffeeLiquidMaterial);
    coffeeInCup.position.set(0, 0.42, 0);
    finjanGroup.add(coffeeInCup);

    // --- Part 6: Coffee Stream for Pouring Animation (تيار انسكاب القهوة) ---
    const coffeeStreamCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.25, 2.2, 0),
      new THREE.Vector3(2.15, 1.2, 0.3),
      new THREE.Vector3(2.0, 0.2, 0.6),
      new THREE.Vector3(1.9, -0.35, 0.8)
    ]);
    const streamGeom = new THREE.TubeGeometry(coffeeStreamCurve, 24, 0.045, 12, false);
    const streamMesh = new THREE.Mesh(streamGeom, coffeeLiquidMaterial);
    streamMesh.scale.set(0, 0, 0); // hidden by default
    dallahPivot.add(streamMesh);
    coffeeStreamRef.current = streamMesh;

    // --- Part 7: Rising Steam Particles from Finjan (بخار الهيل والزعفران) ---
    const steamGroup = new THREE.Group();
    steamGroup.position.set(1.9, -0.2, 0.8);
    mainDallahGroup.add(steamGroup);
    steamGroupRef.current = steamGroup;

    const steamPuffs: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const puffGeom = new THREE.SphereGeometry(0.08 + i * 0.02, 12, 12);
      const puffMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.22 - i * 0.03
      });
      const puff = new THREE.Mesh(puffGeom, puffMat);
      puff.position.set((Math.random() - 0.5) * 0.15, i * 0.2, (Math.random() - 0.5) * 0.15);
      steamGroup.add(puff);
      steamPuffs.push(puff);
    }

    // --- Part 8: Traditional Presentation Pedestal (صينية العرض الذهبية الخافتة) ---
    const trayGeom = new THREE.CylinderGeometry(3.2, 3.4, 0.12, 48);
    const trayMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A2417'),
      metalness: 0.6,
      roughness: 0.45
    });
    const trayMesh = new THREE.Mesh(trayGeom, trayMat);
    trayMesh.position.set(0, -1.06, 0);
    trayMesh.receiveShadow = true;
    mainDallahGroup.add(trayMesh);

    // Decorative brass inlay border on tray
    const trayRimGeom = new THREE.TorusGeometry(3.22, 0.04, 16, 48);
    const trayRim = new THREE.Mesh(trayRimGeom, engravedRingMaterial);
    trayRim.rotation.x = Math.PI / 2;
    trayRim.position.y = -1.0;
    mainDallahGroup.add(trayRim);

    // 6. Animation Loop
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Smooth Rotation Interpolation
      if (isAutoRotate && !isDraggingRef.current && !isPouringAnimRef.current) {
        targetRotationYRef.current += delta * 0.5;
      }

      rotationYRef.current += (targetRotationYRef.current - rotationYRef.current) * 0.08;
      rotationXRef.current += (targetRotationXRef.current - rotationXRef.current) * 0.08;

      if (mainDallahGroup) {
        mainDallahGroup.rotation.y = rotationYRef.current;
        mainDallahGroup.rotation.x = rotationXRef.current;
        mainDallahGroup.scale.set(zoomRef.current, zoomRef.current, zoomRef.current);
      }

      // Pouring Animation Physics
      if (isPouringAnimRef.current) {
        pourProgressRef.current += delta * 1.25;
        const p = pourProgressRef.current;

        // Realistic pouring tilt curve: tilt down, hold, tilt back
        let tiltAngle = 0;
        if (p < 0.8) {
          // Tilting down
          const ease = Math.sin((p / 0.8) * (Math.PI / 2));
          tiltAngle = ease * 0.42;
        } else if (p < 2.0) {
          // Sustained pour with subtle hand tremor
          tiltAngle = 0.42 + Math.sin(p * 15) * 0.012;
        } else if (p <= 2.6) {
          // Return to upright
          const returnP = (p - 2.0) / 0.6;
          tiltAngle = (1 - returnP) * 0.42;
        }

        dallahPivot.rotation.z = -tiltAngle;
        dallahPivot.position.y = Math.sin(tiltAngle) * 0.2;

        // Show/animate coffee stream
        if (coffeeStreamRef.current) {
          if (p >= 0.5 && p <= 2.1) {
            const streamScale = Math.min(1, (p - 0.5) * 4);
            coffeeStreamRef.current.scale.set(streamScale, 1, streamScale);
            coffeeStreamRef.current.position.y = Math.sin(p * 20) * 0.01;
          } else {
            coffeeStreamRef.current.scale.set(0, 0, 0);
          }
        }
      } else {
        // Return pivot to neutral
        dallahPivot.rotation.z *= 0.85;
        dallahPivot.position.y *= 0.85;
      }

      // Steam Particle Floating Effect
      if (steamPuffs.length > 0) {
        const timeFactor = currentTime * 0.002;
        steamPuffs.forEach((puff, idx) => {
          puff.position.y = ((idx * 0.25 + timeFactor) % 1.2);
          puff.position.x = Math.sin(timeFactor * 2 + idx) * 0.08;
          const puffOpacity = Math.max(0, 0.28 - (puff.position.y / 1.2) * 0.28);
          (puff.material as THREE.MeshBasicMaterial).opacity = isPouringAnimRef.current
            ? puffOpacity * 1.8
            : puffOpacity;
        });
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // 7. Touch & Mouse Orbit Drag Controls
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      targetRotationYRef.current += deltaX * 0.008;
      targetRotationXRef.current = Math.max(
        -0.4,
        Math.min(0.6, targetRotationXRef.current + deltaY * 0.006)
      );
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture fallback
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * -0.0015;
      zoomRef.current = Math.max(0.65, Math.min(1.6, zoomRef.current + zoomDelta));
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // 8. Resize Observer for Responsiveness
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width || 400;
        const h = entry.contentRect.height || 350;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();

      // Dispose Three.js objects
      scene.clear();
      renderer.dispose();
    };
  }, [isAutoRotate]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    zoomRef.current = Math.max(0.65, Math.min(1.6, zoomRef.current + delta));
  };

  const handleResetView = () => {
    targetRotationYRef.current = 0;
    targetRotationXRef.current = 0.15;
    zoomRef.current = 1;
    setSelectedPart(null);
  };

  return (
    <div className={`relative flex flex-col items-center justify-center bg-gradient-to-b from-[#2E1A11] via-[#1F1009] to-[#120804] rounded-3xl border-3 border-[#C7A15A] shadow-2xl overflow-hidden ${className}`}>
      {/* Background Decorative Islamic Arch Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
        <div className="w-72 h-72 rounded-full bg-[#E5B842] blur-3xl" />
      </div>

      {/* Top 3D Badge & Status */}
      <div className="absolute top-3 right-3 left-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-[#8A1538]/90 backdrop-blur-md text-amber-300 px-3.5 py-1 rounded-full text-xs font-black border border-[#C7A15A] shadow-lg flex items-center gap-1.5 pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>مجسم 3D للدلة القطرية</span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            title={isAutoRotate ? 'إيقاف الدوران التلقائي' : 'تشغيل الدوران التلقائي'}
            className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer backdrop-blur-md ${
              isAutoRotate
                ? 'bg-[#C7A15A] text-[#513A2E] border-white shadow-md'
                : 'bg-black/40 text-amber-200 border-amber-500/40 hover:bg-black/60'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isAutoRotate ? 'animate-spin-slow' : ''}`} />
          </button>
          <button
            onClick={() => handleZoom(0.15)}
            title="تكبير"
            className="p-2 rounded-xl text-xs font-bold border border-amber-500/40 bg-black/40 text-amber-200 hover:bg-black/60 transition-all cursor-pointer backdrop-blur-md"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.15)}
            title="تصغير"
            className="p-2 rounded-xl text-xs font-bold border border-amber-500/40 bg-black/40 text-amber-200 hover:bg-black/60 transition-all cursor-pointer backdrop-blur-md"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Mounting Element */}
      <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing select-none flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full outline-none touch-none block" />

        {/* Drag Hint Tooltip */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-black/60 backdrop-blur-sm text-amber-200/90 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-[#C7A15A]/40 flex items-center gap-1.5 shadow-sm">
          <span>اسحب بإصبعك أو الماوس للتدوير 360°</span>
        </div>
      </div>

      {/* Selected Part Educational Info Card */}
      {selectedPart && (
        <div className="absolute bottom-16 left-3 right-3 z-20 bg-[#FAF6EE] text-[#513A2E] p-3 rounded-2xl border-2 border-[#8A1538] shadow-2xl animate-fade-in flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8A1538]" />
              <h4 className="font-black text-sm text-[#8A1538]">{selectedPart.name}</h4>
            </div>
            <p className="text-xs text-[#513A2E]/90 font-bold mt-1 leading-relaxed">
              {selectedPart.desc}
            </p>
          </div>
          <button
            onClick={() => setSelectedPart(null)}
            className="text-xs text-gray-500 hover:text-red-700 font-black p-1 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom Interactive Controls Bar */}
      {showControls && (
        <div className="w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 z-10 flex items-center justify-between gap-2 border-t border-[#C7A15A]/30">
          {/* Pour Coffee Button (صبّ القهوة) */}
          <button
            onClick={handlePour}
            disabled={isPouring}
            className={`px-4 md:px-6 py-2 rounded-2xl font-black text-xs md:text-sm border-2 transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isPouring
                ? 'bg-amber-500 text-black border-yellow-300 ring-2 ring-yellow-400 scale-105'
                : 'bg-[#8A1538] hover:bg-[#70102d] text-amber-200 border-[#C7A15A] hover:scale-102 active:scale-95'
            }`}
          >
            <Coffee className={`w-4 h-4 ${isPouring ? 'animate-bounce text-yellow-900' : 'text-amber-300'}`} />
            <span>{isPouring ? 'جارٍ صبّ القهوة... ☕' : 'جرّب صبّ القهوة باليد اليسار'}</span>
          </button>

          {/* Quick Part Inspection Pills */}
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto py-1">
            {DALLAH_PARTS.slice(0, 3).map(part => (
              <button
                key={part.id}
                onClick={() => setSelectedPart(selectedPart?.id === part.id ? null : part)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  selectedPart?.id === part.id
                    ? 'bg-[#C7A15A] text-[#513A2E] border-white shadow'
                    : 'bg-black/50 text-amber-200/90 border-[#C7A15A]/40 hover:bg-black/70'
                }`}
              >
                {part.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetView}
            className="text-xs text-amber-300/80 hover:text-amber-200 underline font-bold px-2 py-1 cursor-pointer shrink-0"
          >
            إعادة الضبط
          </button>
        </div>
      )}
    </div>
  );
};
