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

Vue.component("Navbar", Navbar);
Vue.component("Header", Header);
Vue.component("LoginForm", LoginForm);
Vue.component("SeriesGraph", SeriesGraph);
Vue.component("StackedBar", StackedBar);
Vue.component("LineGraph", Line)
Vue.component("Loading", Loading)
Vue.component("ModalResizable",ModalResizable)
Vue.component("WeatherWidget",VueWeatherWidget)
