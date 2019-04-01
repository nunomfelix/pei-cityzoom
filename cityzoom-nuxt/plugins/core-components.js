import Vue from 'vue'
import apilogin from "@/components/apiactions/login";
import apiregister from "@/components/apiactions/register";
import apilogout from "@/components/apiactions/logout";
import setavatar from "@/components/apiactions/setavatar";

import avatardisplay from "@/components/user/avatardisplay";

import lasterror from "@/components/errorhandling/lasterror";

Vue.component("apilogin", apilogin);
Vue.component("apiregister", apiregister);
Vue.component("apilogout", apilogout);
Vue.component("setavatar", setavatar);

Vue.component("avatardisplay", avatardisplay);

Vue.component("lasterror", lasterror);
