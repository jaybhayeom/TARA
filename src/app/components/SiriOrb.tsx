import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

// 3D Simplex Noise from Ashima Arts
const noiseGLSL = `
//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
{ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const vertexShader = `
uniform float uTime;
uniform float uSpeed;
uniform float uNoiseDensity;
uniform float uNoiseStrength;

varying vec2 vUv;
varying float vNoise;
varying vec3 vNormal;
varying vec3 vViewPosition;

${noiseGLSL}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  float t = uTime * uSpeed;
  
  // Calculate noise value
  float noise = snoise(position * uNoiseDensity + t);
  vNoise = noise;
  
  // Displace vertex along normal
  vec3 newPosition = position + normal * noise * uNoiseStrength;
  
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;
varying float vNoise;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  // Normalize the normal vector
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  // Create an iridescent color mix based on normals, noise, and time
  float mixValue1 = smoothstep(-1.0, 1.0, vNoise * 2.0);
  vec3 colorMix1 = mix(uColor1, uColor2, mixValue1);
  
  float mixValue2 = smoothstep(-1.0, 1.0, sin(uTime * 0.5 + normal.y * 3.0));
  vec3 finalColor = mix(colorMix1, uColor3, mixValue2);
  
  // Add a rim light / glow effect based on view angle (Fresnel)
  float rim = 1.0 - max(dot(viewDir, normal), 0.0);
  rim = smoothstep(0.5, 1.0, rim);
  
  // Brighter edges for a holographic feel
  vec3 glowColor = finalColor + vec3(rim * 0.9);
  
  gl_FragColor = vec4(glowColor, 1.0);
}
`;

interface SiriOrbProps {
  isListening: boolean;
  baseColor?: string;
}

const SiriOrbMesh = ({ isListening, baseColor = "#a78bfa" }: SiriOrbProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0.5 },
      uNoiseDensity: { value: 1.5 },
      uNoiseStrength: { value: 0.15 },
      uColor1: { value: new THREE.Color(baseColor) },
      uColor2: { value: new THREE.Color('#ec4899') }, // Magenta
      uColor3: { value: new THREE.Color('#06b6d4') }, // Cyan
    }),
    [baseColor]
  );

  // Update base color if it changes
  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uColor1.value.set(baseColor);
    }
  }, [baseColor]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate parameters based on state
      const targetSpeed = isListening ? 2.5 : 0.3;
      const targetStrength = isListening ? 0.4 : 0.1;
      const targetDensity = isListening ? 1.8 : 1.2;
      
      material.uniforms.uSpeed.value = THREE.MathUtils.lerp(material.uniforms.uSpeed.value, targetSpeed, 0.08);
      material.uniforms.uNoiseStrength.value = THREE.MathUtils.lerp(material.uniforms.uNoiseStrength.value, targetStrength, 0.08);
      material.uniforms.uNoiseDensity.value = THREE.MathUtils.lerp(material.uniforms.uNoiseDensity.value, targetDensity, 0.08);
      
      // Rotate the orb
      meshRef.current.rotation.y += isListening ? 0.015 : 0.003;
      meshRef.current.rotation.x += isListening ? 0.01 : 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={false}
        transparent={true}
      />
    </mesh>
  );
};

export const SiriOrb = ({ isListening, baseColor }: SiriOrbProps) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} dpr={[1, 2]}>
        <SiriOrbMesh isListening={isListening} baseColor={baseColor} />
      </Canvas>
    </div>
  );
};
