import _ from "lodash";
import { motion } from "framer-motion";
import { ConsortiumItem } from "./ConsortiumItem";

/**
 * @description Renders the list of consortium item cards.
 * @param {Object} props
 * @param {String[]} props.tags Consortium tags
 * @param {Function} props.setEditGroupsDialog Setter for the edit groups dialog state
 * @param {Function} props.setSubmissionsDialog Setter for the submissions dialog state
 * @returns {JSX.Element} The consortium container.
 */
export function ConsortiumContainer({ tags, setEditGroupsDialog, setSubmissionsDialog }) {
    return (
        <div style={{ overflowY: "auto", paddingBottom: "5rem", paddingRight: "0.5rem" }} className="flex flex-column">
            {_.isArray(tags) && tags.length > 0 ? tags.map((tag, idx) => (
                <div key={`${tag}-${idx}`} className="flex" style={{ marginBottom: "0.8rem" }}>
                    <motion.button
                        className="flex"
                        whileHover={{ backgroundColor: "#efefef" }}
                        style={{ backgroundColor: "#fff", borderRadius: "6px", border: "none", width: "100%" }}
                    >
                        <ConsortiumItem tag={tag} setEditGroupsDialog={setEditGroupsDialog} setSubmissionsDialog={setSubmissionsDialog} />
                    </motion.button>
                </div>
            )) : null}
        </div>
    )
}
