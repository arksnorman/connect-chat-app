// order is important, alternatively use <script> tags
import "amazon-connect-streams";
import "amazon-connect-chatjs";

window.localStorage.removeItem("connectPopupManager::connect::loginPopup");

// Connect information: Replace with your Connect Instance
const CCP_URL = import.meta.env.CCP_URL;
const CONNECT_REGION = import.meta.env.CONNECT_REGION;

const connectRegion = "eu-west-2";

//----------------Init CCP Start----------------------------
try {
    connect.core.initCCP(document.getElementById("test"), {
        ccpUrl: CCP_URL, // REQUIRED
        loginPopup: true, // optional, defaults to `true`
        loginPopupAutoClose: true, // optional, defaults to `false`
        loginOptions: {
            // optional, if provided opens login in new window
            autoClose: true, // optional, defaults to `false`
            height: 600, // optional, defaults to 578
            width: 400, // optional, defaults to 433
            top: 0, // optional, defaults to 0
            left: 0, // optional, defaults to 0
        },

        region: CONNECT_REGION, // REQUIRED for `CHAT`, optional otherwise
        softphone: {
            // optional, defaults below apply if not provided
            allowFramedSoftphone: true, // optional, defaults to false
            disableRingtone: false, // optional, defaults to false
        },
        pageOptions: {
            // optional
            enableAudioDeviceSettings: true, // optional, defaults to 'false'
            enablePhoneTypeSettings: true, // optional, defaults to 'true'
        },
        ccpAckTimeout: 5000, //optional, defaults to 3000 (ms)
        ccpSynTimeout: 3000, //optional, defaults to 1000 (ms)
        ccpLoadTimeout: 10000, //optional, defaults to 5000 (ms)
    });
    connect.getLog().warn("CDEBUG >> CCP initialized");
} catch (err) {
    console.error("initCCP", err);
}

connect.contact(contact => {
    if (contact.getType() !== connect.ContactType.CHAT) {
        // applies only to CHAT contacts
        return;
    }

    contact.getActiveInitialConnection()

    contact.accept({
        "success": () => console.log("Contact Accepted"),
        "failure": () => console.log("Contact Failed to Accept")
    })

    // recommended: calls `connect.ChatSession.setGlobalConfig()` and `connect.ChatSession.create()` internally
    // contact.onAccepted(async () => {
    //     const cnn = contact.getConnections().find(cnn => cnn.getType() === connect.ConnectionType.AGENT);
    //
    //     const agentChatSession = await cnn.getMediaController();
    //     console.log("Contact accepted")
    // });

    // contact.on

    // alternative: if you want control over the args of `connect.ChatSession.setGlobalConfig()` and `connect.ChatSession.create()`
    contact.onAccepted(async () => {
        const cnn = contact.getConnections().find(cnn => cnn.getType() === connect.ConnectionType.AGENT);
        const chatSession = connect.ChatSession.create({
            chatDetails: cnn.getMediaInfo(), // REQUIRED
            options: { // REQUIRED
                region: CONNECT_REGION, // REQUIRED, must match the value provided to `connect.core.initCCP()`
            },
            type: connect.ChatSession.SessionTypes.AGENT, // REQUIRED
            websocketManager: connect.core.getWebSocketManager() // REQUIRED
        })
        const { connectCalled, connectSuccess } = await chatSession.connect();
        chatSession.onMessage(event => {
            const { chatDetails, data } = event;
            console.log("Eveeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeent", event.data)
            console.log("Eveeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeent", chatDetails)
        })
        await chatSession.sendMessage({
            contentType: "text/plain",
            message: "Hello World!: Session"
        });
        // const { AbsoluteTime, Id } = awsSdkResponse.data;
        // chatSession.sendMessage()
    });
});