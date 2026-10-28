import { useEffect, useRef } from "react";

type Strand = {
  lane: number;
  phase: number;
  speed: number;
  amplitude: number;
  width: number;
  alpha: number;
  color: string;
  primary: boolean;
  prominent: boolean;
  pulse: boolean;
  pulseOffset: number;
};

const palette = {
  orchid: "#E879F9",
  magenta: "#F472D0",
  violet: "#7C3AED",
  cyan: "#67E8F9",
  teal: "#5EEAD4",
};

const primaryColors = [palette.orchid, palette.magenta, palette.violet, palette.orchid, palette.cyan];

export default function FlowFieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let visible = !document.hidden;
    const pointer = { x: 0.5, y: 0.5 };
    const strands: Strand[] = [];

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      width = bounds.width;
      height = bounds.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      strands.length = 0;

      const primaryCount = width < 700 ? 3 : width < 1100 ? 4 : 5;
      const filamentCount = width < 700 ? 7 : width < 1100 ? 12 : 17;

      for (let index = 0; index < primaryCount; index += 1) {
        const prominent = index % 2 === 0;
        strands.push({
          lane: index / Math.max(primaryCount - 1, 1),
          phase: index * 1.83,
          speed: 0.000035 + (index % 3) * 0.000012,
          amplitude: prominent ? 34 + (index % 2) * 10 : 24,
          width: prominent ? 3 : 1.65,
          alpha: prominent ? 0.22 : 0.13,
          color: primaryColors[index],
          primary: true,
          prominent,
          pulse: prominent,
          pulseOffset: index * 0.19,
        });
      }

      for (let index = 0; index < filamentCount; index += 1) {
        strands.push({
          lane: (index + 0.5) / filamentCount,
          phase: index * 2.37 + 0.8,
          speed: 0.000045 + (index % 5) * 0.00001,
          amplitude: 14 + (index % 4) * 7,
          width: index % 7 === 0 ? 1.1 : 0.55,
          alpha: index % 7 === 0 ? 0.13 : 0.075,
          color:
            index % 13 === 0
              ? palette.teal
              : index % 9 === 0
                ? palette.cyan
                : index % 2 === 0
                  ? palette.orchid
                  : palette.violet,
          primary: false,
          prominent: false,
          pulse: index % 12 === 0,
          pulseOffset: index * 0.31,
        });
      }
    };

    const drawStrand = (strand: Strand, index: number, time: number) => {
      const phase = strand.phase + time * strand.speed;
      const entryY = height * (0.08 + strand.lane * 0.64);
      const exitLane = (strand.lane * 1.35 + index * 0.07) % 1;
      const exitY = height * (0.06 + exitLane * 0.7);
      const rotation = time * 0.000085;
      const focalX = width * 0.55;
      const focalY = height * 0.34;
      const orbitAngle = strand.phase + index * 0.8 + rotation;
      const orbitRadiusX = width * (strand.primary ? 0.032 : 0.018);
      const orbitRadiusY = height * (strand.primary ? 0.075 : 0.045);
      const gatewayX = focalX + Math.cos(orbitAngle) * orbitRadiusX;
      const gatewayY = focalY + Math.sin(orbitAngle) * orbitRadiusY;
      const drift = Math.sin(phase * 1.2) * strand.amplitude;
      const slowBend = Math.sin(time * 0.000045 + strand.phase) * height * 0.025;
      const pointerDrift = (pointer.y - 0.5) * (strand.primary ? 8 : 3);
      const approachY = entryY + drift * 0.45 + pointerDrift;
      const departureY = exitY - drift * 0.35;
      const tangentX = -Math.sin(orbitAngle) * width * 0.075;
      const tangentY = Math.cos(orbitAngle) * height * 0.13;
      const path = new Path2D();
      const startX = -width * 0.18;
      const firstControlX = width * 0.18;
      const firstCurveControlX = width * 0.39;
      const midpointX = gatewayX;
      const secondCurveStartX = gatewayX + width * 0.14;
      const secondControlX = width * 0.86;
      const endX = width * 1.18;
      const startY = approachY;
      const firstControlY = entryY - strand.amplitude * 0.5 + slowBend;
      const midpointY = gatewayY;
      const endY = departureY;

      path.moveTo(startX, startY);
      path.bezierCurveTo(
        firstControlX,
        firstControlY,
        firstCurveControlX,
        gatewayY + (entryY - gatewayY) * 0.18 - tangentY,
        midpointX,
        midpointY,
      );
      path.bezierCurveTo(
        gatewayX + width * 0.14 + tangentX,
        gatewayY + (exitY - gatewayY) * 0.18 + tangentY,
        secondControlX,
        exitY + slowBend,
        endX,
        endY,
      );

      const pulse = (time * strand.speed * 0.9 + strand.phase * 0.11) % 1;
      const gradient = context.createLinearGradient(0, 0, width, 0);
      const pulseStart = Math.max(0, pulse - (strand.primary ? 0.13 : 0.08));
      const pulseEnd = Math.min(1, pulse + (strand.primary ? 0.13 : 0.08));
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(pulseStart, strand.color);
      gradient.addColorStop(pulse, `rgba(255,255,255,${strand.primary ? 0.9 : 0.55})`);
      gradient.addColorStop(pulseEnd, strand.color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      context.globalAlpha = strand.alpha;
      context.strokeStyle = gradient;
      context.lineWidth = strand.width;
      context.shadowBlur = strand.primary ? 15 : 5;
      context.shadowColor = strand.color;
      context.stroke(path);

      if (strand.prominent) {
        context.globalAlpha = strand.alpha * 0.18;
        context.lineWidth = strand.width * 4;
        context.shadowBlur = 18;
        context.stroke(path);
      }

      if (strand.pulse) {
        const pulsePosition =
          (time * strand.speed * 1.6 + strand.phase * 0.17 + strand.pulseOffset) % 1;
        const pointAt = (progress: number) => {
          const cubic = (
            t: number,
            p0: number,
            p1: number,
            p2: number,
            p3: number,
          ) =>
            (1 - t) ** 3 * p0 +
            3 * (1 - t) ** 2 * t * p1 +
            3 * (1 - t) * t ** 2 * p2 +
            t ** 3 * p3;

          if (progress < 0.5) {
            const t = progress * 2;
            return {
              x: cubic(t, startX, firstControlX, firstCurveControlX, midpointX),
              y: cubic(
                t,
                startY,
                firstControlY,
                gatewayY + (entryY - gatewayY) * 0.18 - tangentY,
                midpointY,
              ),
            };
          }

          const t = (progress - 0.5) * 2;
          return {
            x: cubic(t, midpointX, secondCurveStartX, secondControlX, endX),
            y: cubic(
              t,
              midpointY,
              gatewayY + (exitY - gatewayY) * 0.18 + tangentY,
              exitY + slowBend,
              endY,
            ),
          };
        };

        const head = pointAt(pulsePosition);
        const tail = pointAt(Math.max(0, pulsePosition - 0.028));
        const pulseColor = strand.color === palette.cyan ? palette.cyan : palette.orchid;
        const tailGradient = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
        tailGradient.addColorStop(0, "rgba(255,255,255,0)");
        tailGradient.addColorStop(1, `${pulseColor}99`);
        context.globalAlpha = strand.primary ? 0.38 : 0.2;
        context.strokeStyle = tailGradient;
        context.lineWidth = strand.primary ? 1.25 : 0.65;
        context.shadowBlur = strand.primary ? 5 : 3;
        context.shadowColor = pulseColor;
        context.beginPath();
        context.moveTo(tail.x, tail.y);
        context.lineTo(head.x, head.y);
        context.stroke();

        const pulseGlow = context.createRadialGradient(
          head.x,
          head.y,
          0,
          head.x,
          head.y,
          strand.primary ? 4.5 : 3,
        );
        pulseGlow.addColorStop(0, "rgba(255,255,255,0.5)");
        pulseGlow.addColorStop(0.3, `${pulseColor}bb`);
        pulseGlow.addColorStop(1, "rgba(0,0,0,0)");
        context.globalAlpha = strand.primary ? 0.34 : 0.22;
        context.fillStyle = pulseGlow;
        context.beginPath();
        context.arc(head.x, head.y, strand.primary ? 4.5 : 3, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = strand.primary ? 0.75 : 0.52;
        context.fillStyle = pulseColor;
        context.beginPath();
        context.arc(head.x, head.y, strand.primary ? 1.35 : 0.9, 0, Math.PI * 2);
        context.fill();
      }
    };

    const draw = (timestamp: number) => {
      if (!visible) return;
      const time = reducedMotion ? 0 : timestamp;
      context.clearRect(0, 0, width, height);

      const atmosphere = context.createRadialGradient(
        width * (0.52 + (pointer.x - 0.5) * 0.025),
        height * 0.25,
        0,
        width * 0.52,
        height * 0.25,
        width * 0.58,
      );
      atmosphere.addColorStop(0, "rgba(124, 58, 237, 0.009)");
      atmosphere.addColorStop(0.48, "rgba(232, 121, 249, 0.003)");
      atmosphere.addColorStop(1, "rgba(8, 7, 11, 0)");
      context.fillStyle = atmosphere;
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = "lighter";
      strands.forEach((strand, index) => drawStrand(strand, index, time));

      const routingHaze = context.createRadialGradient(
        width * 0.53,
        height * 0.31,
        0,
        width * 0.53,
        height * 0.31,
        Math.min(width, height) * 0.18,
      );
      routingHaze.addColorStop(0, "rgba(232, 121, 249, 0.045)");
      routingHaze.addColorStop(0.35, "rgba(124, 58, 237, 0.018)");
      routingHaze.addColorStop(1, "rgba(8, 7, 11, 0)");
      context.globalAlpha = 1;
      context.fillStyle = routingHaze;
      context.fillRect(0, 0, width, height);

      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      const fade = context.createLinearGradient(0, height * 0.48, 0, height);
      fade.addColorStop(0, "rgba(8, 7, 11, 0)");
      fade.addColorStop(0.55, "rgba(8, 7, 11, 0.06)");
      fade.addColorStop(1, "rgba(8, 7, 11, 0.65)");
      context.fillStyle = fade;
      context.fillRect(0, height * 0.42, width, height * 0.58);

      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      visible = !document.hidden;
      if (visible) animationFrame = window.requestAnimationFrame(draw);
    };
    const handlePointer = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
    };
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotionPreference);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return <canvas ref={canvasRef} className="landing-flow-field" aria-hidden="true" />;
}
