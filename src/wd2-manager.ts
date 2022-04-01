import { NodeAPI, NodeAPISettingsWithData } from "node-red";
import { WebDriver } from "@critik/simple-webdriver"
import { portCheck } from "./utils";
import { Protocol } from "@critik/simple-webdriver/dist/webdriver";

export class WD2Manager {
    private static _RED : NodeAPI<NodeAPISettingsWithData>;
    private static _serverURL : string = "";
    private static _webDriver : WebDriver

    public static get RED () {
        return WD2Manager._RED;
    }

    public static init (RED : NodeAPI<NodeAPISettingsWithData>) : void {
        WD2Manager._RED = RED;
    }

    /**
     * Define the configuration of the Selenium Server and return a boolean if the server is reacheable
     * @param serverURL
     * @param browser
     */
    public static async setServerConfig(serverURL : string) : Promise<boolean> {
        WD2Manager._serverURL = serverURL;

        const host = serverURL.split(":")[0];
        const port = parseInt(serverURL.split(":")[1] || "80");
        if (!(await portCheck(host, port)))
            return false;
        this._webDriver = new WebDriver(serverURL, Protocol.W3C);
    }

    public static checkIfCritical(error : Error) : boolean {
        // Blocking error in case of "WebDriverError : Failed to decode response from marionett"
        if (error.toString().includes("decode response"))
            return true;
        // Blocking error in case of "NoSuchSessionError: Tried to run command without establishing a connection"
        if (error.name.includes("NoSuchSessionError"))
            return true;
        // Blocking error in case of "ReferenceError" like in case of msg.driver is modified
        if (error.name.includes("ReferenceError"))
            return true;
        // Blocking error in case of "TypeError" like in case of msg.driver is modified
        if (error.name.includes("TypeError"))
            return true;
        return false;
    }

}