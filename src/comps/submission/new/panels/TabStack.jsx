import { TitlePanel } from "./Title";
import React, { useState } from "react";
import "normalize.css"
import { CollaboratorsTab } from "./Collaborators";
import { MandAttributesTab } from "./MandatoryAttributes";
import _ from "lodash"
import { MetatextTab } from "./Metatext";
import { AnimatePresence, motion } from "framer-motion";
import { LinksTab } from "./Links";
import { SamplesTab } from "./Samples";
import { Button } from "@blueprintjs/core";
import { TabNavigation } from "./TabNavigation";

const componentMap = {
    "title": TitlePanel,
    "collaborators": CollaboratorsTab,
    "mandatoryAttributes": MandAttributesTab,
    "metatext": MetatextTab,
    "links": LinksTab,
    "samples" : SamplesTab,
}

const componentNames = {
    "title": "Title",
    "collaborators": "Team",
    "mandatoryAttributes": "Attributes",
    "metatext": "Metatext",
    "links": "Links",
    "samples" : "Samples"
}

const XOFFSET = 50

function TabNavigation2({ componentKey, setComponentKey, submission }) {
    
    return <div className="flex flex-column">
        <h2>{ submission.title}</h2>
        <div className="flex flex-column div-border-right">
    
        {_.keys(componentMap)
            .map(k => <button
                    className={`submission-tab-navigation-button div--round margin--tiny ${componentKey.current === k ? "submission-tab-navigation-button--active" : ""}`} 
                    onClick={() => setComponentKey(prevValues => {
                        return {
                            current: k ,
                            prev: prevValues.current
                        }
                    })}>
                <div className="div--expand flex justify-end">
                    <div>{componentNames[k]}</div>
                </div>
                </button>)
            }
        </div>

    </div>
}


export function TabNextButton({ componentKey, setComponentKey }) {
    
    const componentKeys = _.keys(componentMap) 

    const getNextComponentKey = (componentKey) => {

        const idx = _.indexOf(componentKeys, componentKey.current)
        
        if (idx !== -1 && idx < componentKeys.length - 1) {
            return componentKeys[idx+1]
        }
        
        return -1 
    }

    const nextComponentKey = getNextComponentKey(componentKey)
    
    if (nextComponentKey !== -1) {
        return <button
            onClick={() => setComponentKey(prevValues => {
                return {
                    current: nextComponentKey,
                    prev: prevValues.current
                }
            })}>
            Next
        </button>
    }    
}

const stackVariants = {
    
    enter: (direction) => ({
        x: direction > 0 ? XOFFSET : -XOFFSET, // slide in from the side
        // transition: { duration: 0.5 }
    }),

    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        zIndex: 1,
        transition: { duration: 0.5 },
    },
    exit: (direction) => {
        return {
            x: direction < 0 ? -XOFFSET : XOFFSET, // slide out to the side
            opacity: 0,
            scale: 1.0,
            zIndex: 0,
            transition: { duration: 0.3 },
        }
    }
}

function SelectedComponent({ componentKey, submission, setSubmission, setComponentKey }) {
    
    const SelectedComponent = componentMap[componentKey.current];
    // Fallback for invalid keys
    if (!SelectedComponent) {
        return <div>Component not found</div>;
    }
    return <div style={{ minHeight: "calc(80vh - 150px - 1rem)"}} className="div--expand bg--lightgrey"><SelectedComponent {...{setComponentKey, submission, setSubmission}} /></div>;
}

export function SubmissionPanelStack({
        submission,
        setSubmission,
        onSubmissionRequest,
        saveSubmission,
        resetSubmission
        }) {
    
    // Initial panel for the stack
    const [componentKey, setComponentKey] = useState({ current: "title", prev: undefined });
    const componentKeys = _.keys(componentMap) 


    return <div>
        <div className="navbar__submission__grid__container bg--lightgrey">

        <div className="navbar__submission__grid__left" style={{zIndex:5}}>
            <TabNavigation {...{ componentKey, setComponentKey, componentNames, submission, componentKeys }} />
            
            
        </div>
            <div className="position--relative navbar__submission__grid__right" style={{ zIndex: 2 }}>
                <div className="flex justify-end" style={{margin: "0.2rem"}}>
                    <TabNextButton {...{ componentKey, setComponentKey }} />
                </div>
            <AnimatePresence>
                <motion.div
                    custom={_.isString(componentKey.prev) ? _.indexOf(componentKeys, componentKey.current) - _.indexOf(componentKeys, componentKey.prev) : 0}
                    className="bg--lightgrey div--round"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        padding: "2rem",
                        marginTop: "2rem",
                        maxHeight: "80%",
                        overflow: "scroll"
                    }}
                    key={componentKey.current}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={stackVariants}> 

                    <SelectedComponent {...{ componentKey, submission, setSubmission, setComponentKey }} />
                </motion.div>
            </AnimatePresence>
            
        </div>
            <div className="navbar__submission__grid__bottom">
            <Button text="Submit" onClick={onSubmissionRequest} intent="primary" />
            <Button text="Save" onClick={saveSubmission} />
            <Button text="Reset Form" onClick={resetSubmission} />
        </div>
    </div>
    </div>
}



// <AnimatePresence custom={1}>
//         <motion.div
//           key={currentIndex}
//           custom={1}
//           variants={stackVariants}
//           initial="enter"
//           animate="center"
//           exit="exit"
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             backgroundColor: "#f0f0f0",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             borderRadius: "10px",
//           }}
//         >
//           {items[currentIndex]}
//         </motion.div>
//               </AnimatePresence>


// const FirstPanel = ({ openPanel }) => {
//   const handleNavigate = () => {
//     openPanel({
//       component: SecondPanel,
//       title: "Second Panel",
//     });
//   };

//   return (
//     <Card>
//       <h3>First Panel</h3>
//       <p>This is the content of the first panel.</p>
//       <Button intent="primary" onClick={handleNavigate}>
//         Go to Second Panel
//       </Button>
//     </Card>
//   );
// };

// const SecondPanel = ({ openPanel, closePanel }) => {
//   const handleNavigate = () => {
//     openPanel({
//       component: ThirdPanel,
//       title: "Third Panel",
//     });
//   };

//   return (
//     <Card>
//       <h3>Second Panel</h3>
//       <p>This is the content of the second panel.</p>
//       <Button intent="primary" onClick={handleNavigate}>
//         Go to Third Panel
//       </Button>
//       <Button intent="warning" onClick={closePanel}>
//         Back to First Panel
//       </Button>
//     </Card>
//   );
// };

// const ThirdPanel = ({ closePanel }) => {
//   return (
//     <Card>
//       <h3>Third Panel</h3>
//       <p>This is the content of the third panel.</p>
//       <Button intent="danger" onClick={closePanel}>
//         Back to Second Panel
//       </Button>
//     </Card>
//   );
// };

// export const PanelStack2Example = () => {
//   const [initialPanel] = useState({
//     component: FirstPanel,
//     title: "First Panel",
//   });

//   return (
//     <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
//       <h2>Blueprint.js PanelStack2 Example</h2>
//       <PanelStack2
//         initialPanel={initialPanel}
//         renderActivePanelOnly={true}
//       />
//     </div>
//   );
// };


