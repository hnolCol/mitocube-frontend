import { SVG } from "@/comps/core/charts/SVGHeader";
import { Group } from "@visx/group";


export function ResetZoomSVG({ size = 25, color = "#000", active = false }) {

    // the magnifier (circle + handle) is centered as a composite: circle top-left, handle to bottom-right
    const circleX = size * 0.36
    const circleY = size * 0.36
    const circleR = size * 0.22
    const handleEnd = size * 0.86
    const width = size
    const height = size
    const strokeColor = active ? "#466688" : color
    return (
         <button title={active ? "Zoom is active - click to reset" : "Reset zoom"} className="flex margin--very-little icon__container center-items" style={{outline : "none", border : "none", width: size, height: size, padding : "0px", backgroundColor: active ? "#4666883a" : undefined}} onMouseDown={e => e.stopPropagation()}>
        
            <SVG {...{ width, height  }}>
                <Group  left={0} top={0} >
                    <line x1={circleX + circleR * 0.72} x2={handleEnd} y1={circleY + circleR * 0.72} y2={handleEnd} stroke={strokeColor} strokeWidth={active ? 2 : 1.5}/>
                    <circle cx={circleX} cy={circleY} r={circleR} fill={active ? "#466688" : "white"} stroke={strokeColor} />
                    <line x1={circleX-circleR/2} x2={circleX+circleR/2} y1={circleY} y2={circleY} stroke={active ? "#ffffff" : strokeColor} strokeWidth={1}/>
                </Group>
            </SVG>
            
            
            </button>
    );
}
