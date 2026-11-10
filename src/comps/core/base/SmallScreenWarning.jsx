import PropTypes from "prop-types";
import { Link } from "react-router";

SmallScreenWarning.propTypes = {
    feature: PropTypes.string.isRequired,
};

/**
 * @description Warning shown on pages whose visualizations (heatmaps, volcano plots) do not
 * work on small screens such as an iPad. Rendered as plain HTML without Blueprint so it also
 * stays usable on compact devices. Offers a link to the reduced compact app.
 * @param {Object} props
 * @param {String} props.feature Name of the feature that is unavailable (e.g. "Heatmaps")
 * @returns {JSX.Element} The warning banner.
 */
export function SmallScreenWarning({ feature }) {
    return (
        <div
            role="alert"
            style={{
                margin: "1rem 0",
                padding: "0.75rem 1rem",
                borderRadius: 8,
                border: "1px solid #e5c07b",
                backgroundColor: "#fdf6e3",
                color: "#6b5300",
                fontSize: "0.9rem",
                lineHeight: 1.5,
            }}
        >
            <strong>{feature} are not available on this screen size.</strong>
            <div>
                Your screen is too small (e.g. an iPad) to display {feature.toLowerCase()} reliably.
                Please use a device with a larger screen, or switch to the{" "}
                <Link to="/compact" style={{ color: "#2b6cb0", fontWeight: 600 }}>
                    compact view
                </Link>{" "}
                for submission states, protocols, metatexts, instrument states and messages.
            </div>
        </div>
    );
}

export default SmallScreenWarning;
