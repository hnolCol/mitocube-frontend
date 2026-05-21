import { SVG } from "@/comps/core/charts/SVGHeader";
import { Group } from "@visx/group";


export function ResetZoomSVG({ size = 24, color = "#000" }) {

    const circleX = size / 2.5
    const circleY = size / 2.5
    const width = size
    const height = size
    const strokeColor = color
    return (
         <button className="flex margin--very-little icon__container center-items" style={{outline : "none", border : "none", width: size, height: size, padding : "0px"}} onMouseDown={e => e.stopPropagation()}>
        
            <SVG {...{ width, height  }}>
                <Group  left={0} top={0} >
                    <line x1={circleX} x2={circleX+width/2} y1={circleY} y2={circleY+height/2} stroke={strokeColor} strokeWidth={1.5}/>
                    <circle cx={circleX} cy={circleY} r={width / 4} fill="white" stroke={strokeColor} />
                    <line x1={circleX-width/8} x2={circleX+width/8} y1={circleY} y2={circleY} stroke={strokeColor} strokeWidth={1}/>
                </Group>
            </SVG>
            
            
            </button>
    );
}
