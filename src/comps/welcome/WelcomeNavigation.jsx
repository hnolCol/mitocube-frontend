import { useNavigate } from "react-router"
import { getDashBoardIcon } from "../core/navigation/dashboard/Icons"
import { BaseDashboardIcon } from "../core/svg/icons/dashboard/IconBase"
import "./welcome.css"

const WELCOME_NAV_ITEMS = [
    { label: "New Submission", linkTo: "/submissions/new", iconName: "SampleSubmission" },
    { label: "Explore Datasets", linkTo: "/datasets", iconName: "Dataset" },
    { label: "Explore Proteins", linkTo: "/protein/selection", iconName: "Protein" },
]

export function WelcomeNavigationButtons() {

    const navigate = useNavigate()

    return (
        <div className="welcome-nav">
            {WELCOME_NAV_ITEMS.map(item =>
                <button
                    key={item.linkTo}
                    className="welcome-nav__button"
                    onClick={() => navigate(item.linkTo)}>
                    <BaseDashboardIcon width={80} height={80} className="welcome-nav__icon">
                        {getDashBoardIcon(item.iconName, { fillColor: "#466688" })}
                    </BaseDashboardIcon>
                    <span className="welcome-nav__label">{item.label}</span>
                </button>
            )}
        </div>
    )
}
