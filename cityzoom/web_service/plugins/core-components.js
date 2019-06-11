import Vue from 'vue'
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import LoginForm from "@/components/Login";
import SeriesGraph from "@/components/UI/Graphs/Series"
import StackedBar from "@/components/UI/Graphs/Columns"
import Line from "@/components/UI/Graphs/Line"
import Loading from "@/components/UI/Loading"
import ModalResizable from "@/components/UI/Modal_Resizable"
import VueWeatherWidget from 'vue-weather-widget';
import LineChart from "@/components/UI/Graphs/new/line"
import BarChart from "@/components/UI/Graphs/new/bar"
import Alerts from "@/components/UI/Widgets/Alerts"
import InfoBox from "@/components/UI/Widgets/InfoBox"
import ProcessInfoBox from "@/components/UI/Widgets/ProcessInfoBox"
import DashFooter from "@/components/New_UI/DashFooter.vue"
import DashHeader from "@/components/New_UI/DashHeader.vue"
import NotificationsMenu from "@/components/New_UI/NotificationItem.vue"
import NotificationItem from "@/components/New_UI/NotificationsMenu.vue"
import MessageItem from "@/components/New_UI/MessageItem.vue"
import MessagesMenu from "@/components/New_UI/MessagesMenu.vue"

import TasksMenu from "@/components/New_UI/TasksMenu.vue"
import UserMenu from "@/components/New_UI/UserMenu.vue"

import Dash from '@/components/tmp/Dash.vue'
// import LoginView from '@/components/Login.vue'
// import NotFoundView from '@/components/404.vue'

// Import Views - Dash
import Dashboard from '@/components/New_UI/views/Dashboard.vue'
import TempSideBar from '@/components/New_UI/Sidebar.vue'
import SidebarMenu from '@/components/New_UI/SidebarMenu.vue'
import TablesView from '@/components/New_UI/views/Tables.vue'
// import TasksView from '@/components/views/Tasks.vue'
// import SettingView from '@/components/views/Setting.vue'
// import AccessView from '@/components/views/Access.vue'
// import ServerView from '@/components/views/Server.vue'
// import ReposView from '@/components/views/Repos.vue'


//import PieChart from "@/components/UI/Graphs/new/pie"

Vue.component("Navbar", Navbar);
Vue.component("Header", Header);
Vue.component("LoginForm", LoginForm);
Vue.component("SeriesGraph", SeriesGraph);
Vue.component("StackedBar", StackedBar);
Vue.component("LineGraph", Line)
Vue.component("Loading", Loading)
Vue.component("ModalResizable",ModalResizable)
Vue.component("WeatherWidget",VueWeatherWidget)
Vue.component("LineChart",LineChart)
Vue.component("BarChart",BarChart)
//Vue.component("PieChart",PieChart)
Vue.component("info-box",InfoBox);
Vue.component("alerts",Alerts);
Vue.component("process-info-box",ProcessInfoBox)
Vue.component("dash-footer",DashFooter)
Vue.component("dash-header",DashHeader)
Vue.component("messages-menu",MessagesMenu)
Vue.component("message-item",MessageItem)
Vue.component("notifications-menu",NotificationsMenu)
Vue.component("notification-item",NotificationItem)
Vue.component("tasks-menu",TasksMenu)
Vue.component("user-menu",UserMenu)

Vue.component("Dash",Dash)
Vue.component("Dashboard",Dashboard)
Vue.component("Sidebar",TempSideBar)
Vue.component("sidebar-menu",SidebarMenu)
Vue.component("tables-view",TablesView)
