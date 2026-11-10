import "./compact.css";
import _ from "lodash";
import { Link, useSearchParams } from "react-router";
import { CompactSubmissions } from "./Submissions";
import { CompactInstruments } from "./Instruments";
import { CompactMessages } from "./Messages";

const TABS = [
    { id: "submissions", label: "Submissions" },
    { id: "instruments", label: "Instruments" },
    { id: "messages", label: "Messages" },
];

/**
 * @description Reduced single-page app for small screens (e.g. iPad) where the full
 * dashboard with its complex visualizations is not usable. Offers submission state changes,
 * protocol linking, metatext insertion, instrument state changes and messaging using plain
 * HTML controls (no Blueprint) to keep the mobile bundle and interaction simple.
 * @param {Object} props
 * @param {Object} props.authenticationStatus Current authentication status (user tag).
 * @returns {JSX.Element} The compact app.
 */
function CompactApp({ authenticationStatus }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = TABS.some(t => t.id === searchParams.get("tab")) ? searchParams.get("tab") : "submissions";

    return (
        <div className="compact__root">
            <div className="compact__sticky">
                <div className="compact__header">
                    <h1 className="compact__title">MitoCube Compact</h1>
                    <div className="compact__row" style={{ marginTop: 0 }}>
                        {_.isString(authenticationStatus?.tag) ? (
                            <span className="compact__tag">{authenticationStatus.tag}</span>
                        ) : null}
                        <Link to="/index" className="compact__tag" style={{ color: "#2b6cb0", fontWeight: 600 }}>
                            Full app
                        </Link>
                    </div>
                </div>

                <nav className="compact__nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`compact__nav__button${activeTab === tab.id ? " compact__nav__button--active" : ""}`}
                            onClick={() => setSearchParams({ tab: tab.id })}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="compact__content">
                {activeTab === "submissions" ? <CompactSubmissions /> : null}
                {activeTab === "instruments" ? <CompactInstruments /> : null}
                {activeTab === "messages" ? <CompactMessages user_tag={authenticationStatus?.tag} /> : null}
            </div>
        </div>
    );
}

export default CompactApp;
