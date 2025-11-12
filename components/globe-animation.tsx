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
    camera.position.z = 5
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create main group
    const mainGroup = new THREE.Group()
    globeRef.current = mainGroup
    scene.add(mainGroup)

    // Create central laptop/briefcase representing internship platform
    const laptopGroup = new THREE.Group()
    
    // Laptop base with metallic look
    const baseGeometry = new THREE.BoxGeometry(2.2, 0.12, 1.6)
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e3a8a,
      emissive: 0x1e40af,
      emissiveIntensity: 0.4,
      shininess: 120,
      specular: 0x4a90e2,
    })
    const laptopBase = new THREE.Mesh(baseGeometry, baseMaterial)
    laptopBase.position.y = -0.5
    laptopGroup.add(laptopBase)

    // Laptop screen with gradient effect
    const screenGeometry = new THREE.BoxGeometry(2.1, 1.4, 0.08)
    const screenMaterial = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
      shininess: 100,
      specular: 0x38bdf8,
    })
    const laptopScreen = new THREE.Mesh(screenGeometry, screenMaterial)
    laptopScreen.position.y = 0.2
    laptopScreen.position.z = -0.75
    laptopScreen.rotation.x = -0.25
    laptopGroup.add(laptopScreen)

    // Screen glow effect - enhanced
    const glowGeometry = new THREE.BoxGeometry(1.9, 1.2, 0.01)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.85,
    })
    const screenGlow = new THREE.Mesh(glowGeometry, glowMaterial)
    screenGlow.position.set(0, 0.2, -0.71)
    screenGlow.rotation.x = -0.25
    laptopGroup.add(screenGlow)

    // Add screen border for polish
    const borderGeometry = new THREE.BoxGeometry(2.15, 1.45, 0.02)
    const borderMaterial = new THREE.MeshPhongMaterial({
      color: 0x334155,
      emissive: 0x475569,
      emissiveIntensity: 0.3,
      shininess: 90,
    })
    const screenBorder = new THREE.Mesh(borderGeometry, borderMaterial)
    screenBorder.position.set(0, 0.2, -0.78)
    screenBorder.rotation.x = -0.25
    laptopGroup.add(screenBorder)

    // Add keyboard detail
    const keyboardGeometry = new THREE.BoxGeometry(1.8, 0.03, 1.2)
    const keyboardMaterial = new THREE.MeshPhongMaterial({
      color: 0x0f172a,
      shininess: 60,
    })
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial)
    keyboard.position.set(0, -0.43, 0.1)
    laptopGroup.add(keyboard)

    mainGroup.add(laptopGroup)

    // Create floating documents/certificates around the laptop
    const floatingObjects: THREE.Mesh[] = []
    const documentCount = 16

    for (let i = 0; i < documentCount; i++) {
      // Create document shape with rounded edges
      const docGeometry = new THREE.BoxGeometry(0.35, 0.45, 0.03, 2, 2, 1)
      
      // Varied colors for visual interest
      let color, emissive
      const type = i % 4
      if (type === 0) {
        color = 0xfbbf24  // Gold
        emissive = 0xf59e0b
      } else if (type === 1) {
        color = 0x3b82f6  // Blue
        emissive = 0x2563eb
      } else if (type === 2) {
        color = 0x8b5cf6  // Purple
        emissive = 0x7c3aed
      } else {
        color = 0x10b981  // Green
        emissive = 0x059669
      }
      
      const docMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.9,
        shininess: 80,
        specular: 0xffffff,
      })
      const document = new THREE.Mesh(docGeometry, docMaterial)

      // Position in a spiral pattern for more dynamic look
      const angle = (i / documentCount) * Math.PI * 2
      const spiralFactor = i / documentCount
      const radius = 2.8 + Math.sin(i * 0.7) * 0.6
      document.position.x = Math.cos(angle) * radius
      document.position.y = (spiralFactor - 0.5) * 3 + Math.sin(angle * 1.5) * 0.8
      document.position.z = Math.sin(angle) * radius * 0.6

      // Random rotation
      document.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )

      // Store initial position and rotation for animation
      document.userData = {
        initialX: document.position.x,
        initialY: document.position.y,
        initialZ: document.position.z,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        floatSpeed: Math.random() * 0.4 + 0.4,
        floatOffset: Math.random() * Math.PI * 2,
        scale: 1,
        scaleSpeed: Math.random() * 0.3 + 0.5,
      }

      floatingObjects.push(document)
      mainGroup.add(document)
    }

    // Create icons/symbols representing internship elements
    const iconCount = 12
    for (let i = 0; i < iconCount; i++) {
      // Create glowing spheres with halos
      const iconGeometry = new THREE.SphereGeometry(0.12, 32, 32)
      
      // Alternate between multiple attractive colors
      let iconColor
      const colorType = i % 5
      if (colorType === 0) iconColor = 0x06b6d4      // Cyan
      else if (colorType === 1) iconColor = 0xfbbf24 // Amber
      else if (colorType === 2) iconColor = 0xf43f5e // Rose
      else if (colorType === 3) iconColor = 0x8b5cf6 // Purple
      else iconColor = 0x10b981                       // Emerald
      
      const iconMaterial = new THREE.MeshPhongMaterial({
        color: iconColor,
        emissive: iconColor,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.95,
        shininess: 100,
      })
      const icon = new THREE.Mesh(iconGeometry, iconMaterial)

      // Add glow halo around each icon
      const haloGeometry = new THREE.SphereGeometry(0.18, 32, 32)
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: iconColor,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide,
      })
      const halo = new THREE.Mesh(haloGeometry, haloMaterial)
      icon.add(halo)

      const angle = (i / iconCount) * Math.PI * 2
      const radius = 3.5 + Math.sin(i * 0.4) * 0.3
      icon.position.x = Math.cos(angle) * radius
      icon.position.y = Math.sin(angle * 0.8) * 2.2
      icon.position.z = Math.sin(angle) * radius * 0.4

      icon.userData = {
        orbitAngle: angle,
        orbitRadius: radius,
        orbitSpeed: 0.0008 + Math.random() * 0.0004,
        pulseSpeed: Math.random() * 2 + 1,
        pulseOffset: Math.random() * Math.PI * 2,
      }

      floatingObjects.push(icon)
      mainGroup.add(icon)
    }

    // Create connection lines from laptop to floating objects
    const connectionLines: THREE.Line[] = []
    floatingObjects.forEach((obj, index) => {
      if (index % 2 === 0) { // Connect every other object
        const points = []
        points.push(new THREE.Vector3(0, 0.2, -0.5)) // From laptop screen
        points.push(obj.position.clone())
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        
        // Varied line colors
        let lineColor
        if (index % 6 === 0) lineColor = 0x06b6d4      // Cyan
        else if (index % 6 === 2) lineColor = 0xfbbf24 // Amber
        else lineColor = 0x8b5cf6                       // Purple
        
        const lineMaterial = new THREE.LineBasicMaterial({
          color: lineColor,
          transparent: true,
          opacity: 0.35,
          linewidth: 2,
        })
        
        const line = new THREE.Line(lineGeometry, lineMaterial)
        line.userData.targetObject = obj
        line.userData.pulseOffset = Math.random() * Math.PI * 2
        connectionLines.push(line)
        mainGroup.add(line)
      }
    })

    // Add particle trail effect
    const trailGeometry = new THREE.BufferGeometry()
    const trailCount = 200
    const trailPositions = new Float32Array(trailCount * 3)
    const trailColors = new Float32Array(trailCount * 3)

    for (let i = 0; i < trailCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 4
      const height = (Math.random() - 0.5) * 3
      
      trailPositions[i * 3] = Math.cos(angle) * radius
      trailPositions[i * 3 + 1] = height
      trailPositions[i * 3 + 2] = Math.sin(angle) * radius
      
      // Rainbow-like particle colors
      const hue = Math.random()
      if (hue < 0.33) {
        trailColors[i * 3] = 0.24     // Cyan
        trailColors[i * 3 + 1] = 0.71
        trailColors[i * 3 + 2] = 0.83
      } else if (hue < 0.66) {
        trailColors[i * 3] = 0.98     // Amber
        trailColors[i * 3 + 1] = 0.75
        trailColors[i * 3 + 2] = 0.14
      } else {
        trailColors[i * 3] = 0.54     // Purple
        trailColors[i * 3 + 1] = 0.36
        trailColors[i * 3 + 2] = 0.96
      }
    }

    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3))

    const trailMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    })

    const trailParticles = new THREE.Points(trailGeometry, trailMaterial)
    mainGroup.add(trailParticles)

    // Enhanced lighting with multiple colored lights
    const mainLight = new THREE.PointLight(0x06b6d4, 2.0)
    mainLight.position.set(8, 6, 5)
    scene.add(mainLight)

    const secondaryLight = new THREE.PointLight(0x8b5cf6, 1.5)
    secondaryLight.position.set(-6, -4, 3)
    scene.add(secondaryLight)

    const accentLight = new THREE.PointLight(0xfbbf24, 1.2)
    accentLight.position.set(0, 8, -4)
    scene.add(accentLight)

    const rimLight = new THREE.PointLight(0xf43f5e, 0.8)
    rimLight.position.set(0, -5, 8)
    scene.add(rimLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // Add directional light for better depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)

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
      const time = Date.now() * 0.001

      // Rotate main group slowly
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.003 + mouseX * 0.001
        
        // Animate laptop with smooth motion
        laptopGroup.rotation.y = Math.sin(time * 0.3) * 0.15
        laptopGroup.position.y = Math.sin(time * 0.5) * 0.15
        
        // Pulsing screen glow
        screenGlow.material.opacity = 0.7 + Math.sin(time * 2) * 0.15
      }

      // Animate floating objects
      floatingObjects.forEach((obj, index) => {
        const userData = obj.userData
        
        if (userData.orbitAngle !== undefined) {
          // Orbit animation for icons with pulsing effect
          userData.orbitAngle += userData.orbitSpeed
          obj.position.x = Math.cos(userData.orbitAngle) * userData.orbitRadius
          obj.position.z = Math.sin(userData.orbitAngle) * userData.orbitRadius * 0.4
          obj.position.y = Math.sin(userData.orbitAngle * 0.8) * 2.2
          
          // Pulsing scale effect
          const pulse = 1 + Math.sin(time * userData.pulseSpeed + userData.pulseOffset) * 0.2
          obj.scale.set(pulse, pulse, pulse)
          
          // Rotate icons slowly
          obj.rotation.x = time * 0.5
          obj.rotation.y = time * 0.3
        } else {
          // Float animation for documents with wave motion
          obj.position.y = userData.initialY + Math.sin(time * userData.floatSpeed + userData.floatOffset) * 0.4
          obj.position.x = userData.initialX + Math.cos(time * userData.floatSpeed * 0.5) * 0.2
          obj.rotation.x += userData.rotationSpeed * 0.6
          obj.rotation.y += userData.rotationSpeed * 1.2
          obj.rotation.z += userData.rotationSpeed * 0.4
          
          // Subtle scale animation
          const scale = 1 + Math.sin(time * userData.scaleSpeed + userData.floatOffset) * 0.1
          obj.scale.set(scale, scale, scale)
        }
      })

      // Update connection lines with pulsing opacity
      connectionLines.forEach((line, index) => {
        const targetObj = line.userData.targetObject
        const positions = line.geometry.attributes.position.array as Float32Array
        positions[3] = targetObj.position.x
        positions[4] = targetObj.position.y
        positions[5] = targetObj.position.z
        line.geometry.attributes.position.needsUpdate = true
        
        // Pulsing line opacity
        const material = line.material as THREE.LineBasicMaterial
        material.opacity = 0.25 + Math.sin(time * 2 + line.userData.pulseOffset) * 0.15
      })

      // Animate trail particles
      const trailPositions = trailGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < trailCount; i++) {
        trailPositions[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.01
        
        // Reset particles that go too high or low
        if (trailPositions[i * 3 + 1] > 2 || trailPositions[i * 3 + 1] < -2) {
          trailPositions[i * 3 + 1] = (Math.random() - 0.5) * 3
        }
      }
      trailGeometry.attributes.position.needsUpdate = true
      
      // Rotate trail particles
      trailParticles.rotation.y = time * 0.1

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
      
      // Dispose of geometries and materials
      floatingObjects.forEach((obj) => {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose()
        }
        // Dispose child materials (halos)
        obj.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material instanceof THREE.Material) {
              child.material.dispose()
            }
          }
        })
      })
      
      connectionLines.forEach((line) => {
        line.geometry.dispose()
        if (line.material instanceof THREE.Material) {
          line.material.dispose()
        }
      })
      
      // Dispose laptop elements
      laptopBase.geometry.dispose()
      baseMaterial.dispose()
      laptopScreen.geometry.dispose()
      screenMaterial.dispose()
      screenGlow.geometry.dispose()
      glowMaterial.dispose()
      screenBorder.geometry.dispose()
      borderMaterial.dispose()
      keyboard.geometry.dispose()
      keyboardMaterial.dispose()
      
      // Dispose trail particles
      trailGeometry.dispose()
      trailMaterial.dispose()
      
      renderer.dispose()
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
