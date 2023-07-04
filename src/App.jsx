

import "./comps/core/core.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css"
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { Route, Routes, useLocation } from 'react-router'
import Leftbar from './comps/core/navigation/dashboard/Leftbar'
import { ProtectedRoute } from './comps/core/routes/ProtectedRoute'
import { useEffect, useState } from 'react'
import { checkForTokenInLocalStorage, removeTokenFromLocalStorage } from './services/localstorage'
import { useGetDatasets } from './hooks/queries/datasets.hooks'
import Login from './comps/login';
import SubmissionHeader from './comps/submission';
import SubmissionView from './comps/submission/view';
import Topbar from "./comps/core/navigation/dashboard/Topbar";
import NewSubmission from "./comps/submission/new";
import SubmissionHelp from "./comps/submission/help";
import DatasetHeader from "./comps/dataset";
import DatasetOverview from "./comps/dataset/overview";
import PerformanceHeader from "./comps/performance";
import CategoricalBarplot from "./comps/core/charts/categorical/barplot";
import CollapsableAxes from "./comps/core/charts/collapsableCharts";
import { Button } from "@blueprintjs/core";
import AxisWithBackground from "./comps/core/charts/axis";
import ProteinOverview from "./comps/protein/charts/overview";
import { Link } from "react-router-dom";
import { getAverageAndErrorByGroups, getQuantilesByGroups, normalizeDataToGroup } from "./services/arrays/groupby";
import Welcome from "./comps/welcome";
import Timeline from "./comps/dataset/timeline";
import Register from "./comps/register";
import PerformanceOverview from "./comps/performance/overview";
import SubmissionStatistics from "./comps/submission/statistics";
import ProteinHeader from "./comps/protein";
import ProteinSelection from "./comps/protein/selection";



const initAuthenticationStatus = {
  isAuth: true,
  token: null,
  role: 0, //user role encoded as integer. 
  verified: false
}


function App() {

  const [authenticationStatus, setAuthenticationStatus] = useState(initAuthenticationStatus)
  const location = useLocation()
  const basePathName = location.pathname.split("/")[1]
  
  useEffect(() => {
    //check for token in local storage and validate if present
    const { tokenFound, tokenString } = checkForTokenInLocalStorage()
    if (tokenFound) {
      console.log(tokenString)
    }
  }, [])


  const logout = () => {
    //logs the user out, deletes the token from local storage. 
    removeTokenFromLocalStorage()
    setAuthenticationStatus(initAuthenticationStatus)
  }
  const cc = getAverageAndErrorByGroups()
  const a = getQuantilesByGroups()
  const d = normalizeDataToGroup()
  
  return (
    <div className='dashboard__grid no-scroll'>

      <div className='dashboard__grid__left bg--lightgrey'>
        <Leftbar isAuthenticated={authenticationStatus.isAuth} {...{basePathName}} />
      </div>

      <div className='dashboard__grid__top-row bg--lightgrey'>
        <Topbar isAuthenticated={authenticationStatus.isAuth} {...{basePathName}}/>
      </div>

      <div className='dashboard__grid__fill-center'>
      <Routes>
        <Route path="/" element={
          <Login />
        } />



      <Route path="/register" element={
          <Register />
        } />

      {/* Redirected after successful login */}
      <Route path="/index" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth}>
              <Welcome />
          </ProtectedRoute>} />

      <Route path="/protein" element={
              <ProtectedRoute isAuthenticated={authenticationStatus.isAuth}>
                <ProteinHeader/>
            </ProtectedRoute>}>
            <Route path="/protein/selection" element={<ProteinSelection />} />
            <Route path="/protein/:ID" element={<ProteinOverview />} />
        </Route>

          <Route path="/ptm" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth}>
              <h3>PTM</h3>
            </ProtectedRoute>} />

        <Route path="/dataset/:dataID" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth}>
              <DatasetHeader/>
            </ProtectedRoute>}>
            <Route path="/dataset/:dataID" element={<DatasetOverview />} />
            <Route path="/dataset/:dataID/volcano" element={<h3>Volcano</h3>} />
            <Route path="/dataset/:dataID/heatmap" element={<h3>Heatmap</h3>} />
            <Route path="/dataset/:dataID/mitomap" element={<h3>MitoMap</h3>} />
            <Route path="/dataset/:dataID/timeline" element={<Timeline />} />
            <Route path="/dataset/:dataID/help" element={<div><h3>Datasets Help</h3></div>}/>
          </Route>

      <Route path="/dataset" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth}>
              <div>
                <h3>Datasets Selection</h3>
                <p>Pleaase select a dataset to explore. Tag based search supported.</p>
                <p>Previous selected datasets ...</p>
                <Link to="/dataset/8dlTWpi5MMhF">Dataset1</Link>
              </div>
              
          </ProtectedRoute>} />
        {/* Performance Routes */}
      <Route path="/performance" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth}>
              <PerformanceHeader />
            </ProtectedRoute>}>
            
            <Route index element={<PerformanceOverview />} />
            <Route path="/performance/overview" element={<PerformanceOverview />} />
            <Route path="/performance/runs" element={
              <div>
               
              </div>} />
            
            <Route path="/performance/help" element={<h3>Help</h3>}/>
        </Route>
      
        
          {/* Submission Routes */}
      <Route path="/submission" element={
            <ProtectedRoute isAuthenticated={authenticationStatus.isAuth}>
              <SubmissionHeader/>
            </ProtectedRoute>
          }>
            <Route index element={<NewSubmission authStatus={authenticationStatus} />}/>
            <Route path="/submission/new" element={<NewSubmission authStatus={authenticationStatus} />}/>
            <Route path="/submission/view" element={
              <SubmissionView />} />
            <Route path="/submission/help" element={
              <SubmissionHelp authStatus={authenticationStatus} />} />
            <Route path="/submission/statistics" element={
              <SubmissionStatistics/>} />
      </Route>
    
      <Route path="/admin" element={
          <ProtectedRoute isAuthenticated={authenticationStatus.isAuth}>
              <h3>Admin</h3>
            </ProtectedRoute>} />
          

          <Route path="/contact" element={
            <div><h3>Contact</h3>
              <p>Please utilize the discussion and issue sections of the <a href="https://github.com/hnolcol/mitocube"><span className="h1-span">github</span></a> repository for requestion new web application features.</p>
            </div>} />
             
        
      </Routes>
        

        
      </div>
      
    </div>
  )
}

export default App
