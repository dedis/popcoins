# Title/Front Page

# Blank Page

# Acknowledgements

We would like to express our special thanks to Linus Gasser who gave us the opportunity to do this very interesting project related to the collective authority (Cothority) framework developped by the DeDiS laboratory at EPFL. We would like to thank him for the precious help he gave us anytime we had difficulties and for the knowledge he provided us throughout the semester.
Secondly we would also like to thank our parents and friends who helped us through some hard times finalizing the project within the limited time frame.

# Abstract(https://github.com/dedis/cothority/wiki)
###### Add diagram and state diagram of cothority, the protocols, the services, the apps...

As stated in the acknowledgements, the Cothority(https://github.com/dedis/cothority) framework is developed and maintained by the DeDiS laboratory at EPFL. This project provides a skeleton for developing, analysing, and deploying decentralized, distributed cryptographic protocols. A set of servers running these protocols and communicating to each other is reffered to as a collective authority or cothority and the individual servers are called cothority servers or conodes. A cothority collectively executing decentralized protocols could be used for collective signing, threshold signing or generation of public-randomness, to name only a few. The highest level of abstraction is created by the protocols like the collective signature (CoSi) protocol, the random numbers (RandHound) protocol or the communication (Messaging) protocol used by the conodes to exchange data. Then come the services, who rely on these protocols. As of today there exist a Status service to get the status of a conode, a CoSi service for collective signing, a Guard service which allow distributed encryption and decryption of passwords, a SkipChain service for storing arbitrary data on a permissioned blockchain and an Identity service for distributed key/value pairs storage. On top of these services are running so called apps like Status, CoSi, Guard, collective identity skipchains (CISC) and proof-of-personhood (PoP). In this project report we will only concentrate on the last two of them.

###### CISC APP(TODO)

###### POP APP(https://github.com/dedis/cothority/wiki/PoP)
Anonymity on the internet often trades-off with accountability. Users want to be as anonymous as possible without loosing rights and possibilities. This is in contradiction with a lot of online service providers who need this accountability to be able to provide the user a secure and high quality experience. Captcha is one of the most used method to block out non human beings, but on one side programs are becoming better and better in solving them and on the other side even human being are sometimes not able to correctly decode the Captcha. The PoP app tries to remedy to this problem by prividing so called PoP Token which can be seen as a one time captcha. These token are like completely anonymous ID cards. The PoP Token will prove that we are a human being that was at a specified time at a specified place without revealing which person we are.

# Contents

# Introduction(Diagram to show device/app talking to conode)

As CISC and PoP app are completely implemented and functional in the backend only, it is difficult for casual users to use these technologies without investing a lot of time in the hand-on process of creating and running a conode. The main purpose of this semester project was to lift this restriction and bring these technologies to the casual and non technical user. If you wanted to store data in an identity skipchain or hold a PoP party you had to use the command line interface (CLI) which is really impractical and difficult to use. Giving the end user an easy way to access the Cothority framework functionalities is a crucial part in the process of  bringing new technologies to the mass(or public?).

Almost everyone owns a smartphone, be it an Android device or an iPhone, pretty much everbody has one in their pocket. The idea was to create a cross-platform mobile application for the Cothority (CPMAC), thus make the functionalities accessible to almost everyone and as user friendly as possible.
Starting with a simple proof of concept (PoC) for CISC and PoP as a mobile application, the final aim was to build it such that further technologies of the Cothority framework would be easily implementable and extensible. The JavaScript (JS) language has been chosen, not only due to it's popularity and simplicity but more because it allowed us to write the whole application logic in a single language and have it compiled to run on both wanted platforms, Android and iOS. With only few tweaks and changements(because of restricted libraries only available to NativeScript), the core logic of CPMAC could even be used to run WebApps or desktop applications as there are many frameworks allowing you to compile against these by writing the code in JS. The framwork we chose is called NativeScript(https://www.nativescript.org). And the reasons behind this choice are pretty simple:
- Native apps for Android and iOS (no web views)
- Same UI description for both platforms(other frameworks like React requires two separate descriptions)
- Highly extensible by using NPM plugins and even Gradle(https://gradle.org) (Android) or CocoaPods(https://cocoapods.org) (iOS) when needed

# Background(General diagram showing CPMAC, TECHNOLOGIES, CISC, POP)
## Cothority

The cothority framework is composed of multiple protocols, services and apps. At this state of developement CPMAC only supports the CISC and PoP app but is intended to progressively feature and integrate more apps. We will now present these two apps more deeply.

### CISC(TODO)

### POP(Intuitive model for the pop party process?)

The PoP app of the cothority framework is used to generate and verify proof of personhood i.e., that someone is a human being. This fact is proven by stating that this person was at a specified location at a specified time and thus that he/she is not a bot or any other kind of human simulating program. Before continuing, we'll define some important terms:

- Key Pair: in cryptography a key pair is composed of a public and private key, the public key is shared with anyone as opposed to the private key which has to remain secret to the owner of the key pair, typically a message is encrypted and/or signed with the private key and can then be decrypted and/or verified with the public key
- Conode Linking: before being able to exchange data with a cothority node, one has to link itself to it, this is done by registering the public key on the conode after having shown that one has access to it (typically by reading a short PIN in the server logs)
- PoP Party: a PoP party is a gathering of people wanting to prove that they are human beings by showing everyone that they are able to come to a specific location at a specific time
- Organizer (Org): an organizer is someone hosting a PoP party by providing his conode; since there are multiple organizers - their conodes form a cothority network and thus host the party in a distributed and decentralized manner
- Attendee (Att): an attendee is someone present at a PoP party without providing a conode and thus only attending it for the sake of PoP (an organizer can at the same time be an attendee)
- PoP Party Configuration/Description (Config/Desc): the configuration or description of a PoP party defines all the required properties, it should include the name, the date and time, the location and a list of all the hosting conodes (which is commonly refered to as a roster) for the PoP party
- Attendee Registration: the attendee registration is the process of registering all the public keys of the attendees on each of the organizers conodes, all the organizers have to do it separately for their own server
- Final Statement: a final statement of a PoP party is generated by the cothority network composed of the hosting conodes, it is composed of a PoP party configuration, all the public keys of the attendees, the collective signature generated by the hosting conodes and a boolean to state if this PoP party has been merged with another one
- PoP Token: a PoP token is the final token proving that the holder is a human being and attended this particular PoP party, it is composed of a final statement and a key pair

First, all the organizers have to aggree on a date, a time and a location. Once these properties are set, all the attendees (including the organizers) meet at the right location, date and time. Each organizers has to link itself with his conode, complete the PoP configuration and register it on his own conode, they will then get back the ID of this PoP party, which is from now on used as reference to uniquely identify it. Once every organizer registered the configuration and the PoP party is over, each one of them has to register the list of all the public keys of the attendees. During this step the organizers have to ensure that each attendee only registers one and only one public key, this is a crucial part since otherwise an attendee could generate as many PoP token as he registered public keys. This would then contradict with the fact that each human being is unique and thus should only receive one PoP token for each party he attends. Once every organizer registered all the attendees, the cothority composed of their conodes will finalize the party by generating the final statement containing all the relevant information, which includes a collective signature. This final statement is now sent to the attendees so that they can generate their PoP token by linking this final statement to their key pair.

## Technologies

Throughout this project many different technologies were used, we are now quickly presenting the main ones in a few words.

### Elliptic Curve Cryptography(https://en.wikipedia.org/wiki/Elliptic-curve_cryptography)

This public-key cryptographic system using elliptic curves (EC) has been independently suggested by Neal Koblitz and Victor S. Miller in 1985. EC algorithms only entered wide use in 2004 to 2005. The major difference with prior cryptographic protocols (for example DSA or RSA), that were defined over multiplicative groups of finite fields, is that EC cryptography uses point addition instead of modular exponentiation. This results in faster computation.

### Schnorr Signature(https://en.wikipedia.org/wiki/Schnorr_signature)

The schnorr signature algorithm is considered as one of the simplest scheme being provably secure in a random oracle model to produce digital signatures. In addition to that this signature algorithm is efficient and produces short signatures.

### Protocol Buffers(https://en.wikipedia.org/wiki/Protocol_Buffers) (Protobuf)

Developed by Google, this data interchange format is a language- and platform-neutral structured data serializer. Protobuf allows you to define your data strucure once and then easily write to or read from data streams. In this particular project it is used to encode JS objects and decode byte streams received from the conodes and thus ease the process of data exchange.

### Websocket(https://en.wikipedia.org/wiki/WebSocket)

This communication protocol uses a single TCP connection to send data back and forth while keeping the connection open, thus facilitates real-time data transfers from and to the server. It is the used protocol for data exchange with the conodes.

# Design(Scheme of complete library structure and object structure)

In this chapter we will begin by presenting the main strucuture of the app and then go further into details by showing the different objects and libraries that have been implemented throughout the project.

The app itself uses a side drawer component as navigation between main parts i.e., the home screen, CISC, PoP and the settings. Each one of these drawers then split in multiple tabs if needed to separate sub-section of each component. In each tab you will then only find the functionalities available to this sub-section of the component. Here is the main structure of the app, each main point is a drawer and each sub-point is a tab:

- Home
The home screen is used to display the conodes of the app user, he can add/remove conodes, fetch their statuses and display them as a QR code.
- PoP
  - PoP
  Used to display data shared between attendees and organizers, it shows the list of all the fetched final statements and generated PoP token.
  - Org
  Contains all the functionalities needed by the organizers of a PoP party.
- CISC
(TODO)
- Settings
  - User
  The settings of the user include key pair generation and displaying, you can also completeley reset all the data linked to the user of the app itself.
  - PoP
  In this tab you can reset the global PoP data and the data linked to the organizer.
  - CISC
  (TODO)

In order to easily represent, manage the data and use the corresponding functionalities for all these components we chose to create multiple JS classes that are true singletons (as far as JS allows it). Because we work with singleton classes we were not able to create relationships between them e.g., the class that represents the organizer of a PoP party does not extends the main PoP class (because each subclass instance would recreate their own parent class instance).
Here are the classes we implemented:

- User.js
  Contains all the data and logic that is global and belongs to the user of the app. At this state the user class manages the key pair and the roster displayed in the home screen.
- PoP.js
  Contains everything that is common to organizers and attendees, it manages the list of final statements and PoP token belonging to the user.
  - Org.js
  Representing the organizer of a PoP party, in this class you'll find the current linked conode, th current PoP configuration, the currently registered attendees and the ID of the current PoP description.
  - Att.js
  This class is only a skeleton for now and not used at all. It is a placeholder for future implementations that are specific to the attendees of a PoP party.
- Cisc.js
  (TODO)

In addition to these objects we wrote some libraries so that we can easily manipulate any kind of data, may it be local or exchanged with conodes. The main parts are:

- Convert.js
- Crypto.js
- Helper.js
- Net.js
- protobuf
