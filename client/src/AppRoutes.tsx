import React from "react";
import { Route, Switch } from "wouter";
import Dashboard from "./pages/Dashboard";
import RealTime from "./pages/RealTime";
import TargetsPage from "./pages/TargetsPage";
import AttacksPage from "./pages/AttacksPage";
import DetectionsPage from "./pages/DetectionsPage";
import ExportPage from "./pages/ExportPage";

export default function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/real-time" component={RealTime} />
      <Route path="/dashboard/targets" component={TargetsPage} />
      <Route path="/dashboard/attacks" component={AttacksPage} />
      <Route path="/dashboard/detections" component={DetectionsPage} />
      <Route path="/dashboard/export" component={ExportPage} />
    </Switch>
  );
}
