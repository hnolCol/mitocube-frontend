import React from "react";
import PropTypes from 'prop-types';
import _ from "lodash";

Point.propTypes = {
    idx : PropTypes.number, //index for point
    xscale: PropTypes.func,
    yscale: PropTypes.func,
    p : PropTypes.array,
    r : PropTypes.number, //circle radius 
    defaultCircleFill: PropTypes.string,
    fillGreaterZero : PropTypes.string,
    fillSmallerZero : PropTypes.string,

}


function Point({idx,p, r = 4, opacity = 0.95,  fill = "red", stroke="#262626", strokeWidth = 1,  circleProps = {}, mouseOver, mouseOverParams = {dataID : "2"}}) {
  /* render using props */
    const xValue = p[0]
    const yValue = p[1]
    return( 
        <circle 
            key={`${idx}-pp`} 
            cx={xValue}  //move scale outsite? 
            cy={yValue}  //move scale outsite?  // p[2]?p[0]>0?"#ea563c":"#7894a2":defaultCircleFill
            onMouseOver={e => mouseOver(e,idx,mouseOverParams)}
            {...{opacity,fill, r, stroke, strokeWidth}}
            {...circleProps}/>
    )
  }


  function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (prevProps.r !== nextProps.r) return false 
    if (prevProps.fill !== nextProps.fill) return false 
    if (prevProps.opacity !== nextProps.opacity) return false 
    if (prevProps.p[0] !== nextProps.p[0]) return false
    if (prevProps.p[1] !== nextProps.p[1]) return false

    //if (!_.isEqual(prevProps.p,nextProps.p)) return false 
   // if (!_.isEqual(prevProps.xscale.domain,nextProps.xscale.domain)) return false 
    return true
  }
  export default React.memo(Point, areEqual);