import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, MeshTransmissionMaterial, Sparkles, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Photo backdrop rendered inside the scene so the glass shapes refract it.
function Backdrop({ src }) {
  const texture = useTexture(src);
  texture.colorSpace = THREE.SRGBColorSpace;
  const { camera, viewport, size } = useThree();
  const ref = useRef();
  const z = -6;
  const vp = viewport.getCurrentViewport(camera, [0, 0, z]);
  const imgAspect = texture.image.width / texture.image.height;
  // "object-fit: cover" with 12% bleed for parallax.
  const [w, h] = vp.width / vp.height > imgAspect ? [vp.width, vp.width / imgAspect] : [vp.height * imgAspect, vp.height];

  useFrame((state, dt) => {
    const p = state.pointer;
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, -p.x * 0.35, 3, dt);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, -p.y * 0.2, 3, dt);
  });

  return (
    <mesh ref={ref} position={[0, 0, z]} key={size.width}>
      <planeGeometry args={[w * 1.12, h * 1.12]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Glass({ children, ...props }) {
  return (
    <mesh {...props}>
      {children}
      <MeshTransmissionMaterial
        samples={6}
        resolution={512}
        thickness={0.6}
        roughness={0.02}
        transmission={1}
        ior={1.35}
        chromaticAberration={0.08}
        anisotropy={0.2}
        distortion={0.25}
        distortionScale={0.4}
        temporalDistortion={0.08}
        backside
        backsideThickness={0.3}
      />
    </mesh>
  );
}

function Shapes({ compact }) {
  const group = useRef();
  const torus = useRef();
  useFrame((state, dt) => {
    const p = state.pointer;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, p.x * 0.25, 2.5, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -p.y * 0.15, 2.5, dt);
    torus.current.rotation.x += dt * 0.25;
    torus.current.rotation.y += dt * 0.15;
  });
  const s = compact ? 0.5 : 1;
  const x = compact ? 1.2 : 2.6;
  return (
    <group ref={group} scale={s} position={[x, compact ? 2.6 : 0.1, compact ? -1 : 0]}>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.2}>
        <Glass position={[0, 0, 0]}>
          <sphereGeometry args={[1.25, 64, 64]} />
        </Glass>
      </Float>
      <Float speed={2.2} rotationIntensity={1} floatIntensity={1.5}>
        <Glass ref={torus} position={[1.9, 1.5, -1]}>
          <torusGeometry args={[0.6, 0.22, 48, 96]} />
        </Glass>
      </Float>
      <Float speed={2.6} rotationIntensity={1.5} floatIntensity={2}>
        <Glass position={[-1.7, -1.3, 0.6]} rotation={[0.4, 0.3, 0]}>
          <icosahedronGeometry args={[0.55, 0]} />
        </Glass>
      </Float>
      <Float speed={3} floatIntensity={2.5}>
        <mesh position={[1.5, -1.6, 0.8]}>
          <sphereGeometry args={[0.28, 48, 48]} />
          <meshStandardMaterial color="#ffb347" emissive="#ff7a45" emissiveIntensity={1.4} roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={2} floatIntensity={3}>
        <Glass position={[-1.2, 1.6, -0.5]}>
          <sphereGeometry args={[0.35, 48, 48]} />
        </Glass>
      </Float>
    </group>
  );
}

export default function Hero3D({ image }) {
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);
  const compact = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, []);

  // Pause rendering when the hero scrolls out of view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, compact ? 1.25 : 1.75]}
        camera={{ position: [0, 0, 8], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined}
        eventPrefix="client"
      >
        <Suspense fallback={null}>
          <Backdrop src={image} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={2} color="#fff1dc" />
          <Shapes compact={compact} />
          <Sparkles count={compact ? 30 : 60} scale={[12, 6, 4]} size={2.5} speed={0.4} color="#ffe6b0" opacity={0.8} />
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={4} color="#ffd8a8" position={[0, 5, -5]} scale={[10, 3, 1]} />
            <Lightformer form="circle" intensity={3} color="#5eead4" position={[-5, 1, -1]} scale={3} />
            <Lightformer form="circle" intensity={3} color="#fb7185" position={[5, -1, 1]} scale={3} />
            <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 0, 6]} scale={4} />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
