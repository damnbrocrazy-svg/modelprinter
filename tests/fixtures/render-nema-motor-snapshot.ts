import { createNemaMotorMesh, mp, type NemaSize } from "../../src"
import { renderModelSnapshot } from "./render-model-snapshot"
export function renderNemaMotorSnapshot(size: NemaSize) {
  const modelString = `nema${size}`
  const p = mp.string(modelString).json()
  if (p.fn !== "nema") throw new Error("Expected NEMA")
  const { fn, ...props } = p
  const center = (p.shaftLength - p.bodyLength) / 2
  const span = Math.max(p.bodyWidth, p.bodyLength + p.shaftLength) * 1.7
  const target = [0, 0, center] as const
  return renderModelSnapshot({
    mesh: createNemaMotorMesh(props),
    title: `NEMA ${size} / STEPPER MOTOR`,
    modelString,
    footer:
      "POPPYGL / FOUR VIEWS / MOUNTING FACE Z=0 / SHAFT ALONG +Z / DIMENSIONS IN mm",
    views: [
      {
        name: "ISOMETRIC",
        detail: `${p.bodyWidth} mm FACE / ${p.bodyLength} mm BODY`,
        eye: [50, -65, center + 55],
        target,
        span,
        far: 300,
      },
      {
        name: "TOP",
        detail: `4 HOLES / ${p.mountingHoleSpacing} mm SQUARE PITCH`,
        eye: [0, -20, center + 90],
        target,
        span: (p.bodyWidth + (p.bodyLength + p.shaftLength) * 0.22) * 1.4,
        far: 300,
      },
      {
        name: "FRONT",
        detail: `${p.shaftDiameter} mm SHAFT / ${p.shaftLength} mm FROM FACE`,
        eye: [0, -90, center],
        target,
        span,
        far: 300,
      },
      {
        name: "SIDE",
        detail:
          p.shaftShape === "d"
            ? `${p.shaftFlatDepth} mm FLAT DEPTH / ${p.shaftFlatLength} mm FLAT LENGTH`
            : "ROUND SHAFT / BLIND MOUNTING HOLES",
        eye: [90, 0, center],
        target,
        span,
        far: 300,
      },
    ],
  })
}
