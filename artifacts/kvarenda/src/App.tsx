import { Layout } from "@/components/layout/layout";
import { RoleProvider } from "@/lib/role-context";
import { I18nProvider } from "@/lib/i18n";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Home } from "@/pages/home";
import { Listings } from "@/pages/listings";
import { ListingDetail } from "@/pages/listing-detail";
import { Apply } from "@/pages/apply";
import { MyApplications } from "@/pages/my-applications";
import { MyRentals } from "@/pages/my-rentals";
import { OwnerDashboard } from "@/pages/owner-dashboard";
import { OwnerListingForm } from "@/pages/owner-listing-form";
import { ContractView } from "@/pages/contract-view";
import { Admin } from "@/pages/admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/listings" component={Listings} />
        <Route path="/listings/:id" component={ListingDetail} />
        <Route path="/apply/:listingId" component={Apply} />
        <Route path="/my/applications" component={MyApplications} />
        <Route path="/my/rental" component={MyRentals} />
        <Route path="/my/contract/:id" component={ContractView} />
        <Route path="/owner" component={OwnerDashboard} />
        <Route path="/owner/listings/new" component={() => <OwnerListingForm />} />
        <Route path="/owner/listings/:id/edit" component={OwnerListingForm} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <RoleProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </RoleProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
