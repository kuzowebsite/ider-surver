"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, Timer, Shield, Lightbulb } from "lucide-react"

import { useRouter } from "next/navigation"

const FuturisticShapes = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-[1px] w-full"
            style={{
              top: `${10 + i * 10}%`,
              background: `linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, ${0.1 + i * 0.02}) 50%, transparent 100%)`,
              opacity: 0.3 + (i % 3) * 0.2,
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 20 - i,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {Array.from({ length: 15 }).map((_, i) => {
        const size = 100 + Math.random() * 300
        return (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0) 70%)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [Math.random() * 50, Math.random() * -50, Math.random() * 50],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 10 + Math.random() * 20,
              ease: "easeInOut",
            }}
          />
        )
      })}

      <div className="absolute inset-0 bg-[url('/dots.svg')] bg-repeat opacity-10" />
    </div>
  )
}

const NeonLogo = () => {
  return (
    <motion.div
      className="relative mb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="relative z-10 text-5xl font-bold text-white tracking-wider">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ИИС</span>
      </div>
      <motion.div
        className="absolute inset-0 blur-md rounded-full"
        style={{
          background: "linear-gradient(90deg, rgba(56, 189, 248, 0.7), rgba(59, 130, 246, 0.7))",
          filter: "blur(8px)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 2,
        }}
      />

      <div className="absolute -inset-2 rounded-full border border-cyan-500/30" />
      <div className="absolute -inset-4 rounded-full border border-cyan-500/20" />
      <div className="absolute -inset-6 rounded-full border border-cyan-500/10" />
    </motion.div>
  )
}

const NeonButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="relative z-10 text-lg px-8 py-6 rounded-md bg-transparent border border-cyan-500/50 text-white overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
          <ChevronRight className={`h-5 w-5 transition-transform ${isHovered ? "translate-x-1" : ""}`} />
        </span>

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </Button>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-md bg-cyan-500/20 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const CyberCard = ({
  title,
  description,
  icon,
  delay = 0,
}: {
  title: string
  description: string
  icon: React.ReactNode
  delay?: number
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative border border-cyan-500/20 rounded-md p-6 bg-slate-900/50 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent)",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 3,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-full h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent)",
        }}
        animate={{
          x: ["100%", "-100%"],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 3,
          ease: "linear",
        }}
      />

      <div className="flex items-start gap-4">
        <motion.div
          className="mt-1 p-2 rounded-md text-cyan-400"
          animate={
            isHovered
              ? {
                  color: "rgb(34, 211, 238)",
                  textShadow: "0 0 8px rgba(34, 211, 238, 0.5)",
                }
              : {
                  color: "rgb(56, 189, 248)",
                  textShadow: "none",
                }
          }
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <div>
          <motion.h3
            className="text-xl font-semibold mb-2 text-white"
            animate={
              isHovered
                ? {
                    color: "rgb(255, 255, 255)",
                    textShadow: "0 0 8px rgba(56, 189, 248, 0.5)",
                  }
                : {
                    color: "rgb(255, 255, 255)",
                    textShadow: "none",
                  }
            }
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>
          <p className="text-slate-300">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

const NeonText = ({
  children,
  className = "",
  delay = 0,
  color = "cyan",
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  color?: "cyan" | "blue" | "purple"
}) => {
  const colorMap = {
    cyan: "from-cyan-400 to-blue-500",
    blue: "from-blue-400 to-indigo-500",
    purple: "from-purple-400 to-pink-500",
  }

  const shadowMap = {
    cyan: "rgba(56, 189, 248, 0.7)",
    blue: "rgba(96, 165, 250, 0.7)",
    purple: "rgba(192, 132, 252, 0.7)",
  }

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={`relative z-10 text-transparent bg-clip-text bg-gradient-to-r ${colorMap[color]}`}>
        {children}
      </div>
      <motion.div
        className="absolute inset-0 blur-sm opacity-50 z-0"
        style={{ color: shadowMap[color] }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 2,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

const CyberDivider = () => {
  return (
    <div className="relative h-[1px] w-full my-12">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
        animate={{
          opacity: [0, 1, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 2,
        }}
      />
    </div>
  )
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showIntro])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100 && showIntro) {
        setShowIntro(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [showIntro])

  return (
    <main className="min-h-screen flex flex-col relative text-white">
      <FuturisticShapes />

      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-center px-4"
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(45deg, rgba(56, 189, 248, 0.1), rgba(59, 130, 246, 0.1))",
                  boxShadow: "0 0 30px rgba(56, 189, 248, 0.3)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(56, 189, 248, 0.2)",
                    "0 0 40px rgba(56, 189, 248, 0.4)",
                    "0 0 20px rgba(56, 189, 248, 0.2)",
                  ],
                }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              >
                <span className="text-3xl font-bold text-white tracking-wider">ИИС</span>
              </motion.div>
              <motion.h1
                className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
                animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
                transition={{ duration: 4, times: [0, 0.2, 0.8, 1] }}
              >
                Идэр Их Сургууль
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-3xl mx-auto">
          <NeonLogo />

          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <NeonText color="cyan">Идэр Их Сургуулийн</NeonText>
            <NeonText color="blue" delay={0.2}>
              Цахим Орчны Судалгаа
            </NeonText>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Бид таны <span className="text-cyan-400 font-medium">үнэтэй саналыг</span> сонсож, илүү хэрэгцээт, хялбар
            ашиглагдах <span className="text-cyan-400 font-medium">цахим орчин</span> бүрдүүлэхийг зорьж байна. Таны
            оролцоо бидний <span className="text-cyan-400 font-medium">хөгжилд чухал хувь нэмэр</span> оруулах болно.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mb-16"
          >
            <NeonButton onClick={() => router.push("/survey")}>Судалгаанд оролцох</NeonButton>
          </motion.div>

          <CyberDivider />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <CyberCard
              title="Хурдан & Энгийн"
              description="Ердөө 5 минутын үнэтэй цагаа зарцуулж, бидний үйлчилгээг сайжруулахад тусална уу"
              icon={<Timer className="h-6 w-6" />}
              delay={1.1}
            />
            <CyberCard
              title="Бүрэн Нууцлалтай"
              description="Таны өгсөн мэдээлэл нь зөвхөн судалгааны зорилгоор ашиглагдах бөгөөд бүрэн хамгаалагдсан"
              icon={<Shield className="h-6 w-6" />}
              delay={1.2}
            />
            <CyberCard
              title="Бодит Өөрчлөлт"
              description="Таны санал шууд тусгагдаж, илүү сайн, хэрэглэгчдэд ээлтэй цахим орчин бүрдүүлэхэд тусална"
              icon={<Lightbulb className="h-6 w-6" />}
              delay={1.3}
            />
          </motion.div>
        </div>
      </div>

      <footer className="py-4 text-center text-sm text-slate-400 border-t border-cyan-500/20 backdrop-blur-sm bg-slate-900/30">
        <p>© {new Date().getFullYear()} Идэр Их Сургууль. Бүх эрх хуулиар хамгаалагдсан.</p>
      </footer>
    </main>
  )
}

