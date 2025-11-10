"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { motion } from "framer-motion"

export default function GlobeAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const globeRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 2.5
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create globe group
    const globeGroup = new THREE.Group()
    globeRef.current = globeGroup
    scene.add(globeGroup)

    // Create main wireframe sphere with gradient effect
    const frameGeometry = new THREE.IcosahedronGeometry(1.2, 24)
    const frameMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    })
    const wireframe = new THREE.LineSegments(frameGeometry, frameMaterial)
    globeGroup.add(wireframe)

    // Create secondary wireframe for depth
    const frameGeometry2 = new THREE.IcosahedronGeometry(0.95, 20)
    const frameMaterial2 = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      linewidth: 1,
      transparent: true,
      opacity: 0.4,
    })
    const wireframe2 = new THREE.LineSegments(frameGeometry2, frameMaterial2)
    globeGroup.add(wireframe2)

    // Create animated particles with glow
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 500

    // Generate particles with realistic distribution
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const radius = 1.0 + Math.random() * 0.15

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      sizes[i] = Math.random() * 0.03 + 0.01
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const particleCanvas = document.createElement("canvas")
    particleCanvas.width = 64
    particleCanvas.height = 64
    const ctx = particleCanvas.getContext("2d")
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
      gradient.addColorStop(0.5, "rgba(100, 200, 255, 0.8)")
      gradient.addColorStop(1, "rgba(0, 100, 255, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 64, 64)
    }

    const particleTexture = new THREE.CanvasTexture(particleCanvas)

    const particlesMaterial = new THREE.PointsMaterial({
      map: particleTexture,
      color: 0x00d4ff,
      size: 0.02,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    globeGroup.add(particlesMesh)

    // Create connecting lines with gradient effect
    const linesGeometry = new THREE.BufferGeometry()
    const linePositions: number[] = []
    const lineColors: number[] = []
    const maxDistance = 0.45

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3]
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < maxDistance) {
          // Add line positions
          linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
          linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2])

          // Add color gradient based on distance
          const colorIntensity = 1 - distance / maxDistance
          lineColors.push(0, 212 * colorIntensity, 255) // Cyan
          lineColors.push(0, 212 * colorIntensity, 255) // Cyan
        }
      }
    }

    if (linePositions.length > 0) {
      linesGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3))
      linesGeometry.setAttribute("color", new THREE.BufferAttribute(new Uint8Array(lineColors), 3, true))

      const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        linewidth: 1,
        fog: false,
      })

      const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial)
      globeGroup.add(linesMesh)
    }

    // Create rotating equatorial rings
    const ringCount = 3
    for (let ring = 0; ring < ringCount; ring++) {
      const ringGeometry = new THREE.BufferGeometry()
      const ringPositions: number[] = []
      const segments = 128
      const radius = 1.3 + ring * 0.15
      const rotationOffset = (ring / ringCount) * Math.PI * 0.5

      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius * 0.3
        const z = Math.sin(angle) * radius * 0.3

        ringPositions.push(x, y, z)
      }

      ringGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ringPositions), 3))

      const ringMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + ring * 0.05, 1, 0.5),
        transparent: true,
        opacity: 0.3,
        linewidth: 1,
      })

      const ringMesh = new THREE.LineLoop(ringGeometry, ringMaterial)
      ringMesh.userData.rotationAxis = new THREE.Vector3(0.5, 1, 0.2).normalize()
      ringMesh.userData.rotationSpeed = 0.0003 + ring * 0.0001
      globeGroup.add(ringMesh)
    }

    // Enhanced lighting
    const mainLight = new THREE.PointLight(0x00d4ff, 1.2)
    mainLight.position.set(8, 6, 5)
    scene.add(mainLight)

    const secondaryLight = new THREE.PointLight(0x6366f1, 0.8)
    secondaryLight.position.set(-6, -4, 3)
    scene.add(secondaryLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    // Animation loop with interactive rotation
    let animationId: number
    let mouseX = 0
    let mouseY = 0

    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Rotate globe
      if (globeRef.current) {
        globeRef.current.rotation.x += 0.00015 + mouseY * 0.0001
        globeRef.current.rotation.y += 0.0006 + mouseX * 0.0001
        globeRef.current.rotation.z += 0.00003

        // Rotate secondary elements
        globeRef.current.children.forEach((child) => {
          if (child.userData.rotationAxis) {
            const axis = child.userData.rotationAxis as THREE.Vector3
            const speed = child.userData.rotationSpeed || 0.0003
            child.rotateOnWorldAxis(axis, speed)
          }
        })
      }

      renderer.render(scene, camera)
    }

    animate()
    containerRef.current.addEventListener("mousemove", onMouseMove)

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      containerRef.current?.removeEventListener("mousemove", onMouseMove)
      cancelAnimationFrame(animationId)
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current?.removeChild(renderer.domElement)
      }
      renderer.dispose()
      frameGeometry.dispose()
      frameMaterial.dispose()
      frameGeometry2.dispose()
      frameMaterial2.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      particleTexture.dispose()
      linesGeometry.dispose()
    }
  }, [])

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-96 sm:h-[500px] md:h-[600px] overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
    />
  )
}
