import Home from "./containers/Home";
import PostedList from "./containers/PostedList";
import SubmittedList from "./containers/SubmittedList";
import ViewBounty from "./containers/ViewBounty";
import CreateBounty from "./containers/CreateBounty";
import Contract from "./containers/Contract";
import Account from "./containers/Account"

export const routes = [
    {
        path: '/',
        title: 'Home',
        breadcrumb: 'Home',
        breadcrumb_link: true,
        exact: true,
        component: Home,
    },
    {
        path: '/posted',
        title: 'Posted Bounties',
        breadcrumb: 'Posted',
        breadcrumb_link: true,
        exact: true,
        component: PostedList,
    },
    {
        path: '/submitted',
        title: 'Submitted Bounties',
        breadcrumb: 'Submitted',
        breadcrumb_link: true,
        exact: true,
        component: SubmittedList,
    },
    {
        path: '/bounty/create',
        title: 'Create Bounty',
        breadcrumb: 'Create',
        breadcrumb_link: true,
        exact: true,
        component: CreateBounty,
    },
    {
        path: '/bounty/:id',
        title: 'View Bounty',
        breadcrumb: 'Bounty',
        breadcrumb_link: true,
        exact: true,
        component: ViewBounty,
    },
    {
        path: '/contract',
        title: 'Contract',
        breadcrumb: 'Contract',
        breadcrumb_link: true,
        exact: true,
        component: Contract,
    },
    {
        path: '/account',
        title: 'Account',
        breadcrumb: 'Account',
        breadcrumb_link: true,
        exact: true,
        component: Account,
    }
];