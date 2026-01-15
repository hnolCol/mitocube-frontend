import "./comps/core/core.css";

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/datetime2/lib/css/blueprint-datetime2.css";
import "@blueprintjs/table/lib/css/table.css";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import axios from "axios";
import _ from "lodash";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";

import { getItemFromLocalStorage, removeItemFromLocalStorage } from "./services/localstorage";
import { useTokenValid } from "./hooks/queries/login.hooks";

/* Core layout / navigation */
import Leftbar from "./comps/core/navigation/dashboard/Leftbar";
import Topbar from "./comps/core/navigation/dashboard/Topbar";

/* Routes / route guards */
import { ProtectedAdminRoute, ProtectedRoute } from "./comps/core/routes/ProtectedRoute";

/* Authentication / Login */
import Login from "./comps/login";

/* Submission area */
import SubmissionHeader from "./comps/submission";
import SubmissionView from "./comps/submission/view";
import NewSubmission from "./comps/submission/new";
import SubmissionHelp from "./comps/submission/help";
import SubmissionStatistics from "./comps/submission/statistics";
import InitialSubmission from "./comps/submission/new/InitialSubmission";
import AddExistingSubmission from "./comps/submission/add";

/* Analysis / dataset pages */
import DatasetHeader from "./comps/analysis";
import DatasetOverview from "./comps/analysis/overview";
import DatasetSelection from "./comps/analysis/selection";
import DatasetHeatmap from "./comps/analysis/heatmap";
import DatasetVolcanoPlot from "./comps/analysis/volcano";
import DatasetQC from "./comps/analysis/qc";
import DatasetPCA from "./comps/analysis/pca";
import DatasetHelp from "./comps/analysis/help";
import Runlist from "./comps/analysis/runlist";
import DatasetFeatureCorrelation from "./comps/analysis/correlation";
import {SubmissionSamples} from "./comps/analysis/samples";
import {DatasetFeatureView} from "./comps/analysis/features";
import Timeline from "./comps/analysis/timeline";
import { MitomapNetwork } from "./comps/analysis/mitomap";

/* Protein pages */
import ProteinHeader from "./comps/protein";
import ProteinSelection from "./comps/protein/selection";
import { ProteinPage } from "./comps/protein/charts/overview";

/* Performance area */
import PerformanceHeader from "./comps/performance";
import PerformanceOverview from "./comps/performance/overview";
import PerformanceRuns from "./comps/performance/runs";
import PerformanceInstruments from "./comps/performance/instruments";
import { InstrumentView } from "./comps/performance/instruments/View";

/* Admin area */
import AdminHeader from "./comps/admin";
import ShareToken from "./comps/admin/ShareToken";
import { AdminGenotypes } from "./comps/admin/genotypes/Genotypes";
import { AdminProteomes } from "./comps/admin/proteomes/Proteomes";
import { AdminFilterSets } from "./comps/admin/filters";
import { AdminResearchGroup } from "./comps/admin/researchgroup/ResearchGroups";
import { AdminPhenotype } from "./comps/admin/phenotypes/Phenotypes";
import { UsersAdminView } from "./comps/admin/users/index";
import { UserView } from "./comps/admin/users/View";
import { AttributesAdminView } from "./comps/admin/attributes/index";
import { AdminSymptoms } from "./comps/admin/symptoms/Symptoms";
import { AdminSparepart } from "./comps/admin/spareparts/Sparepart";
import { AdminExternalService } from "./comps/admin/externalservice/ExternalService";
import { AdminAnnotations } from "./comps/admin/annotations/Annotations";

/* Other pages / utilities */
import PTM from "./comps/ptm";
import Welcome from "./comps/welcome";
import {AIPage} from "./comps/ai";
import { AdminProcedure } from "./comps/admin/procedure/Procedure";

/* axios defaults */
axios.defaults.headers.common["Content-Type"] = "application/json";

const initAuthenticationStatus = {
  isAuth: false,
  token: "", // JWT token string
  tag: undefined, // user tag
  role: 0, // user role encoded as integer
  verified: false,
};

const initApplicationInfo = {
  app_name: undefined,
  app_description: undefined,
  version: "0.0",
  lead_contact: undefined,
  email: "",
};

function App() {
  const [tokenFromStorage, setTokenFromStorage] = useState({ token: undefined, locationPathName: "/" });
  const [authenticationStatus, setAuthenticationStatus] = useState(initAuthenticationStatus);
  const [applicationInfo, setApplicationInfo] = useState(initApplicationInfo);

  // set up filter for datasets/submissions
  const [submissionsQuery, setSubmissionQuery] = useState({ attributes: "", plain: "", minimalView: false });
  const [submissionFilter, setSubmissionFilter] = useState({});

  const location = useLocation();
  const redirect = useNavigate();
  const basePathName = location.pathname.split("/")[1];

  // check if token is valid, if a token is found in storage.
  const {
    data: isTokenValid,
    isSuccess: tokenValidSuccess,
    isLoading: tokenValidIsLoading,
    isFetching: tokenValidIsFetching,
    isError: tokenValidIsError,
    error: tokenValidError,
  } = useTokenValid(
    { tokenString: tokenFromStorage.token },
    {
      // if a token is found in local storage, then check it only if authenticationStatus.isAuth is not yet true.
      enabled: _.isString(tokenFromStorage.token) && !authenticationStatus.isAuth,
    }
  );

  useEffect(() => {
    // Check for token in local storage and validate if present
    // Store the location.pathname and search params for redirect after login
    const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: "token" });
    const search = location.search || "";
    if (itemFound) {
      setTokenFromStorage({ token: itemValue, locationPathName: location.pathname, locationSearch: search });
    } else {
      setTokenFromStorage((prevValues) => ({ ...prevValues, locationPathName: location.pathname, locationSearch: search }));
    }
  }, []);

  useEffect(() => {
    // Use effect if token string was found in storage.
    if (tokenValidIsError && tokenValidError.response.status === 401) {
      logout();
    } else if (_.isObject(isTokenValid) && isTokenValid.success) {
      setAuthenticationStatus({
        isAuth: true,
        token: tokenFromStorage.token,
        verified: isTokenValid.verified,
        tag: isTokenValid.tag,
        role: isTokenValid.role,
      });
      axios.defaults.headers.common["Authorization"] = `Bearer ${tokenFromStorage.token}`;
      const redirectPath = tokenFromStorage.locationPathName === "/" ? "/index" : tokenFromStorage.locationPathName;
      const redirectSearch = tokenFromStorage.locationSearch || "";
      redirect(redirectPath + redirectSearch);
    }
  }, [tokenValidSuccess, _.isObject(isTokenValid), tokenValidIsError]);

  /**
   * @description Logs the user out by deleting the token from local storage and removing the axios default
   * Authorization header. It will also redirect the user to '/'
   */
  const logout = () => {
    removeItemFromLocalStorage("token");
    setAuthenticationStatus(initAuthenticationStatus);
    setTokenFromStorage({ token: undefined, locationPathName: "/" });
    axios.defaults.headers.common["Authorization"] = `Bearer`;
    redirect("/");
  };

  return (
    <div className="dashboard__grid no-scroll">
      <div className="dashboard__grid__left bg--lightgrey">
        <Leftbar isAuthenticated={authenticationStatus.isAuth} {...{ basePathName }} />
      </div>

      <div className="dashboard__grid__top-row bg--lightgrey">
        <Topbar {...{ basePathName, authenticationStatus, logout, user_tag : authenticationStatus.tag }} />
      </div>

      <div className="dashboard__grid__fill-center">
        <Routes>
          <Route
            path="/"
            element={<Login {...{ setAuthenticationStatus, redirectedFrom: tokenFromStorage.locationPathName }} />}
          />

          {/* <Route path="/register" element={
              <Register />
            } /> */}

          {/* Redirected after successful login */}
          <Route
            path="/index"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <Welcome {...{ authenticationStatus, applicationInfo, setApplicationInfo }} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/protein"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <ProteinHeader />
              </ProtectedRoute>
            }
          >
            <Route path="/protein/selection" element={<ProteinSelection {...{ authenticationStatus }} />} />
            <Route path="/protein/:ID" element={<ProteinPage {...{ authenticationStatus }} />} />
          </Route>

          <Route
            path="/ptm"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <PTM />
              </ProtectedRoute>
            }
          />

          <Route
            path="/datasets"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <DatasetSelection {...{ logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery }} />
              </ProtectedRoute>
            }
          />

          {/* Performance Routes */}
          <Route
            path="/performance"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <PerformanceHeader />
              </ProtectedRoute>
            }
          >
            <Route index element={<PerformanceOverview />} />
            <Route path="/performance/overview" element={<PerformanceOverview />} />
            <Route path="/performance/instruments/" element={<PerformanceInstruments />} />
            <Route path="/performance/instruments/:instrument_tag" element={<InstrumentView />} />
            <Route path="/performance/runs" element={<PerformanceRuns />} />
            {/* <Route path="/performance/help" element={<h3>Help</h3>}/> */}
          </Route>

          {/* Submission Routes */}
          <Route
            path="/submissions"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <SubmissionHeader />
              </ProtectedRoute>
            }
          >
            <Route index element={<NewSubmission {...{ authenticationStatus, logout }} />} />
            <Route path="/submissions/new" element={<InitialSubmission {...{ authenticationStatus, logout }} />} />
            <Route
              path="/submissions/view"
              element={<SubmissionView {...{ authenticationStatus, logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery }} />}
            />
            <Route path="/submissions/existing" element={<AddExistingSubmission {...{ authenticationStatus, logout }} />} />
            <Route path="/submissions/help" element={<SubmissionHelp authStatus={authenticationStatus} />} />
            <Route
              path="/submissions/statistics"
              element={<SubmissionStatistics {...{ authenticationStatus, logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery }} />}
            />
          </Route>

          <Route
            path="/submissions/:tag"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <DatasetHeader {...{ authenticationStatus, logout }} />
              </ProtectedRoute>
            }
          >
            <Route path="/submissions/:tag" element={<DatasetOverview {...{ logout }} />} />
            <Route path="/submissions/:tag/features" element={<DatasetFeatureView {...{ logout }} />} />
            <Route path="/submissions/:tag/samples" element={<SubmissionSamples {...{ logout }} />} />
            <Route path="/submissions/:tag/volcano" element={<DatasetVolcanoPlot {...{ logout }} />} />
            <Route path="/submissions/:tag/correlation" element={<DatasetFeatureCorrelation {...{ logout }} />} />
            <Route path="/submissions/:tag/heatmap" element={<DatasetHeatmap {...{}} />} />
            <Route path="/submissions/:tag/pca" element={<DatasetPCA {...{ logout }} />} />
            <Route path="/submissions/:tag/qc" element={<DatasetQC {...{ logout }} />} />
            <Route path="/submissions/:tag/mitomap" element={<MitomapNetwork />} />
            <Route path="/submissions/:tag/timeline" element={<Timeline {...{ logout }} />} />
            <Route path="/submissions/:tag/runlist" element={<Runlist />} />
            <Route path="/submissions/:tag/help" element={<div><DatasetHelp /></div>} />
          </Route>

          <Route
            path="/ai/chat"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <AIPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                {/* // isAdmin={authenticationStatus.role === 4} */}
                <AdminHeader {...{ authenticationStatus }} />
              </ProtectedRoute>
            }
          >
            {/* <Route index element={<div>Admin Settings</div>} />  */}
            <Route index path="/admin/attributes" element={<AttributesAdminView {...{ authenticationStatus }} />} />
            <Route path="/admin/users" element={<UsersAdminView />} />
            <Route path="/admin/sharetoken" element={<ShareToken {...{ authenticationStatus }} />} />
            <Route path="/admin/attributes" element={<AttributesAdminView {...{ authenticationStatus }} />} />
            <Route path="/admin/genotypes" element={<AdminGenotypes />} />
            <Route path="/admin/proteomes" element={<AdminProteomes />} />
            <Route path="/admin/sets" element={<AdminFilterSets />} />
            <Route path="/admin/researchgroup" element={<AdminResearchGroup />} />
            <Route path="/admin/phenotypes" element={<AdminPhenotype />} />
            <Route path="/admin/symptoms" element={<AdminSymptoms />} />
            <Route path="/admin/spareparts" element={<AdminSparepart />} />
            <Route path="/admin/procedure" element={<AdminProcedure />} />
            <Route path="/admin/externalservice" element={<AdminExternalService />} />
            <Route path="/admin/annotations" element={<AdminAnnotations />} />
          </Route>

          <Route
            path="/admin/users/:tag"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <UserView {...{ authenticationStatus }} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/attributes/:tag"
            element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth} isLoadingToken={tokenValidIsFetching || tokenValidIsLoading}>
                <div><h3>Attributes</h3></div>
                <div>THis is attributes</div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact"
            element={
              <div>
                <h3>Contact</h3>
                <p>
                  Please utilize the discussion and issue sections of the{" "}
                  <a href="https://github.com/hnolcol/mitocube">
                    <span className="h1-span">github</span>
                  </a>{" "}
                  repository for requestion new web application features.
                </p>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
