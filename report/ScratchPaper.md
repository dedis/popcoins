# Title/Front Page

# Blank Page

# Acknowledgements

We would like to express our special thanks to Linus Gasser who gave us the opportunity to do this very interesting project related to the collective authority (Cothority) framework developped by the DeDiS laboratory at EPFL. We would like to thank him for the precious help he gave us anytime we had difficulties and for the knowledge he provided us throughout the semester.
Secondly we would also like to thank our parents and friends who helped us through some hard times finalizing the project within the limited time frame.

# Abstract(https://github.com/dedis/cothority/wiki)
###### Add diagram and state diagram of cothority, the protocols, the services, the apps...

As stated in the acknowledgements, the Cothority(https://github.com/dedis/cothority) framework is developed and maintained by the DeDiS laboratory at EPFL. This project provides a skeleton for developing, analysing, and deploying decentralized, distributed cryptographic protocols. A set of servers running these protocols and communicating to each other is reffered to as a collective authority or cothority and the individual servers are called cothority servers or conodes. A cothority collectively executing decentralized protocols could be used for collective signing, threshold signing or generation of public-randomness, to name only a few. The highest level of abstraction is created by the protocols like the collective signature (CoSi) protocol, the random numbers (RandHound) protocol or the communication (Messaging) protocol used by the conodes to exchange data. Then come the services, who rely on these protocols. As of today there exist a Status service to get the status of a conode, a CoSi service for collective signing, a Guard service which allow distributed encryption and decryption of passwords, a SkipChain service for storing arbitrary data on a permissioned blockchain and an Identity service for distributed key/value pairs storage. On top of these services are running so called apps like Status, CoSi, Guard, collective identity skipchains (CISC) and proof-of-personhood (PoP). In this project report we will only concentrate on the last two of them.

###### CISC APP(https://github.com/dedis/cothority/wiki/Cisc)
Cisc allows you to get your own provisioned blockchain to store your data. For example, it is possible to store SSH public keys of all your devices and configure it to rotate the keys when needed. It is also possible to store static web pages and any other data as it basicaly consist of a key-value pair storage. To use the Cisc you will need to:
- create a blockchain (using the Cothority for example)
- Add a group of devices allowed to vote on the data
- Use the CLI to add any data you want


###### POP APP(https://github.com/dedis/cothority/wiki/PoP)
Anonymity on the internet often trades-off with accountability. Users want to be as anonymous as possible without loosing rights and possibilities. This is in contradiction with a lot of online service providers who need this accountability to be able to provide the user a secure and high quality experience. Captcha is one of the most used method to block out non human beings, but on one side programs are becoming better and better in solving them and on the other side even human being are sometimes not able to correctly decode the Captcha. The PoP app tries to remedy to this problem by prividing so called PoP Token which can be seen as a one time captcha. These token are like completely anonymous ID cards. The PoP Token will prove that we are a human being that was at a specified time at a specified place without revealing which person we are.

# Contents

# Introduction(Diagram to show device/app talking to conode)

As CISC and PoP app are completely implemented and functional in the backend only, it is difficult for casual users to use these technologies without investing a lot of time in the hand-on process of creating and running a conode. The main purpose of this semester project was to lift this restriction and bring these technologies to the casual and non technical user. If you wanted to store data in an identity skipchain or hold a PoP party you had to use the command line interface (CLI) which is really impractical and difficult to use. Giving the end user an easy way to access the Cothority framework functionalities is a crucial part in the process of  bringing new technologies to the mass(or public?).

Almost everyone owns a smartphone, be it an Android device or an iPhone, pretty much everbody has one in their pocket. The idea was to create a cross-platform mobile application for the Cothority (CPMAC), thus make the functionalities accessible to almost everyone and as user friendly as possible.
Starting with a simple proof of concept (PoC) for CISC and PoP as a mobile application, the final aim was to build it such that further technologies of the Cothority framework would be easily implementable and extensible. The JavaScript (JS) language has been chosen, not only due to it's popularity and simplicity but more because it allowed us to write the whole application logic in a single language and have it compiled to run on both wanted platforms, Android and iOS. With only few tweaks and changements(because of restricted libraries only available to NativeScript), the core logic of CPMAC could even be used to run WebApps or desktop applications as there are many frameworks allowing you to compile against these by writing the code in JS. The framwork we chose is called NativeScript(https://www.nativescript.org). The reasons behind this choice are pretty simple:
- Native apps for Android and iOS (no web views)
- Same UI description for both platforms(other frameworks like React requires two separate descriptions)
- Highly extensible by using NPM plugins and even Gradle(https://gradle.org) (Android) or CocoaPods(https://cocoapods.org) (iOS) when needed

# Background(General diagram showing CPMAC, TECHNOLOGIES, CISC, POP)
## Cothority

The cothority framework is composed of multiple protocols, services and apps. At this state of developement CPMAC only supports the CISC and PoP app but is intended to progressively feature and integrate more apps. We will now present these two apps more deeply.

### CISC(TODO)
CISC stands for Cothority Identity SkipChain. The goal of this application is to provide a simple way to store data. It is based on Identity SkipChains which are permissioned blockchain-based key/value storages for organizing identities (e.g., SSH-keys). The main use of the Cisc is to store data so that it is easy to modify/add/remove it if you have a majority of the registered device in your controle. This way, if the user loose a device or one of his device gets stolen, he won't loose the data, and no harm can be done. Here are some of the terms that will be used throughout this paper:
- SkipChain: a very simple, extendable voting-based permissioned blockchain based on the Chainiac-paper. In the cisc implementation, users use a personal blockchain to store there data.
- Data: The data stored on the Cisc SkipChain can either be SSH-public keys, web pages or any key-value pairs.
- Manager: the owner of the SkipChain.
- Device: any device stored on the skipchain. It is identified by a keypair, the public one being stored on the skipchain. For the moment a device can either be a laptop using the Cisc CLI or a smartphone using our cross platform application.

### POP(Intuitive model for the pop party process?)

The PoP app of the cothority framework is used to generate and verify proof of personhood i.e., that someone is a human being. This fact is proven by stating that this person was at a specified location at a specified time and thus that he/she is not a bot or any other kind of human simulating program. Before continuing, we'll define some important terms:

- Key Pair: in cryptography a key pair is composed of a public and private key, the public key is shared with anyone as opposed to the private key which has to remain secret to the owner of the key pair, typically a message is encrypted and/or signed with the private key and can then be decrypted and/or verified with the public key
- Conode Linking: before being able to exchange data with a cothority node, one has to link itself to it, this is done by registering the public key on the conode after having shown that one has access to it (typically by reading a short PIN in the server logs)
- PoP Party: a PoP party is a gathering of people wanting to prove that they are human beings by showing everyone that they are able to come to a specific location at a specific time
- Organizer (Org): an organizer is someone hosting a PoP party by providing his conode; since there are multiple organizers - their conodes form a cothority network and thus host the party in a distributed and decentralized manner
- Attendee (Att): an attendee is someone present at a PoP party without providing a conode and thus only attending it for the sake of PoP (an organizer can at the same time be an attendee)
- PoP Party Configuration/Description (Config/Desc): the configuration or description of a PoP party defines all the required properties, it should include the name, the date and time, the location and a list of all the hosting conodes (a list of conodes is commonly refered to as a roster) for the PoP party
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

### Protocol Buffers(https://en.wikipedia.org/wiki/Protocol_Buffers) (ProtoBuf)

Developed by Google, this data interchange format is a language- and platform-neutral structured data serializer. Protobuf allows you to define your data strucure once and then easily write to or read from data streams. In this particular project it is used to encode JS objects and decode byte streams received from the conodes and thus ease the process of data exchange.

### Websocket(https://en.wikipedia.org/wiki/WebSocket)

This communication protocol uses a single TCP connection to send data back and forth while keeping the connection open, thus facilitates real-time data transfers from and to the server. It is the used protocol for data exchange with the conodes.

# Design(Scheme of complete app, library and object structure)

In this chapter we will begin by presenting the main strucuture of the app and then go further into details by showing the different objects and libraries that have been implemented throughout the project.

The app itself uses a side drawer component as navigation between main parts i.e., the home screen, CISC, PoP and the settings. Each one of these drawers then splits in multiple tabs if needed to separate sub-section of each component. In each tab you will then only find the functionalities available to this sub-section of the component. Here is the main structure of the app, each main point is a drawer and each sub-point is a tab:

- Home
The home screen is used to display the conodes of the app user, he can add/remove conodes, fetch their statuses and display them as a QR code.
- PoP
  - PoP
  Used to display data shared between attendees and organizers, it shows the list of all the fetched final statements and generated PoP token.
  - Org
  Contains all the functionalities needed by the organizers of a PoP party.
- CISC
  - Home
  This is the main tab of the Cisc drawer. If you are not connected to an identity skipchain you will be prompted to do so. If you are connected to a skipchain you will have the possibility to see the data on the skipchain, see the proposed data and vote for them.
  - QR
  This page display the adress to connect to the identity skipchain and its QR code representation.
  - Data
  This page allows you to add simple key/value pairs.
- Settings
  - User
  The settings of the user include key pair generation and displaying, you can also completeley reset all the data linked to the user of the app itself.
  - PoP
  In this tab you can reset the global PoP data and the data linked to the organizer.
  - CISC
  This tab allows you to disconnect from the current stored skipchain and reset all the data linked to the Cisc component of the app.

In order to easily represent, manage the data and use the corresponding functionalities for all these components we chose to create multiple JS classes that are true singletons (as far as JS allows it). Singletons permitted us to always work on the exact same object independently from the location we require the class, since we have to store data locally we had to load the saved states for each one of theses classes into memory. Thanks to the singleton design pattern this only executes once either at the start of the app or the first time the class is required, all subsequent calls will use this pre-loaded object. On the other hand, since we work with singletons, we were not able to create relationships between them e.g., the class that represents the organizer of a PoP party does not extends the main PoP class (each subclass instance would recreate their own parent class instance). Here are the classes that have been implemented:

- User.js
  Contains all the data and logic that is global and belongs to the user of the app. At this state the user class manages the key pair and the roster displayed in the home screen.
- PoP.js
  Contains everything that is common to organizers and attendees, it manages the list of final statements and PoP token belonging to the user.
  - Org.js
  Representing the organizer of a PoP party, in this class you'll find the current linked conode, the current PoP configuration, the currently registered attendees and the ID of the current PoP description.
  - Att.js
  This class is only a skeleton for now and not used at all. It is a placeholder for future implementations that are specific to the attendees of a PoP party (see future work).
- Cisc.js
  This class represnts the Cisc user. It manages the stored and proposed data on the skipchain, its adress and the viewmodel used for data binding in the cisc drawer.

In addition to these objects we wrote some libraries so that we can easily manipulate any kind of data, may it be local or exchanged with conodes. The main libraries are:

- Convert.js
  Library for converting data types but also to parse all kind of stored data.
- Crypto.js
  Everything related to cryptography which includes but is not limited to key pair generation, message signing and verification or EC points aggregation.
- Helper.js
  All kind of helper functions that may be needed in several different places but do not belong to any other library.
- Net.js
  Contains all the methods related to communication over the internet, mayb it be over websockets of HTTP requests.
- protobuf/
  Creation, encoding, decoding and more using protocol buffers to efficiently use the same object structure as the CISC and PoP implementations in Go(https://golang.org) from the DeDiS lab.

The classes and libraries in combination provides any required logic to execute the CISC and PoP apps locally but also to perfom any communication needed with the conodes. We chose to implement these in such a way that it could not only be taken out as a whole and be used as library for any other JS project related to the Cothority framework with as few tweaks and changements as possible (some will still be required), but also to easily be extensible for other Cothority apps that will one day be implemented into the app. We decided to call this aggregation of libraries "DeDjS".
Throughout the whole project any data like keys, IDs or EC points are handled as unsigned bytes arrays (Uint8Array in JS) but shown to the user in the base64(https://en.wikipedia.org/wiki/Base64) format (unless explicitely stated differently). This combines an easy way of handling the data and an easy way for he user to read it on the screen. Moreover, since JS is an untyped language, we decided to implement DeDjS in such a way that it is as type safe as possible. This choice of implementation has been made to prevent simple errors; and this way it is possible to always return meaningful exception messages when a required type is incorrect.
A lot of logic in DeDjS requires writing/reading data to/from the disk or sending messages over the internet in order to use functionalities of Cothority. These tasks are slow, generate delay and could even fail with relatively high probability. One of the challenges was to find a way to execute all these tasks in an asynchronous way to not block the main thread of the app and handle excpetions in a simple and clean manner. The solution to this problem was that, since ECMAScript(https://en.wikipedia.org/wiki/ECMAScript) 2015 it is possible to use promises(https://en.wikipedia.org/wiki/Futures_and_promises, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) in JS. Thus, we decided to implement DeDjS so that it uses promises anytime an asychronous task is needed. This way the main thread of the app will never be blocked and the exceptions can easily be handled by the simple syntax provided by JS.

# App User(EXAMPLE OF JSON AND TOML DESC OF CONODE - SHOW SCREENSHOTS)

The user of the app is represented by a single class, the User.js object. This singleton handles everything that is global to the app, the user and does not belong to CISC or PoP in particular e.g., the roster displayed in the home drawer and the key pair managed in the user tab of the home drawer. After the loading screen of the app, one lands in the home drawer. Here are two main components, the roster of the user and a button to fetch the status of all the conodes part of this roster. To add a new server one can either enter the information manually or scan a QR code with either a JSON(https://www.json.org) or TOML(https://github.com/toml-lang/toml) description of the node. After being added to the roster the status of all the servers in the roster will be fetched and can be re-fetched at anytime with the corresponding button. To see the status of a conode simply click on one of the conodes in the list, this will open a new page containing all the fetched stats of the conode. On top of this page is a button that permits the user to display a QR code representing the conode. This permits convinient sharing of conodes e.g., when setting up a PoP party description.
The next functionalities of the user are located in the user tab in the settings drawer. Here, the user has the ability to generate a new key pair at any time which will then be displayed in this tab. The public and the private keys are both shown in base64 format. Moreover the user can display his key pair as QR code (with the private key removed). For example this could be used to easily get registered in a PoP party. The last button in thu users settings is to completely reset any data related to the user(THIS ACTION IS PERMANENT AND CAN NOT BE UNDONE) i.e., the roster displayed in the home drawer and the key pair displayed in the settings.

# CISC

As it was shown earlier, right now the Cisc is only available on computers using the CLI developped by the DeDiS lab. The point of the Cisc is to have multiple devices connected to the skipchain for security reasons. Indeed, using the Cisc allow the user to spread its data, without giving the opportunity to an attacker to modifiy it without having access to a given threshold of devices. That is why it was necessary to develop an application to allow user to manage the Cisc data on smartphones. This section will present the work done in the Cisc drawer of the app, the results that were achieved and some of the possible future work to improve the application.

## Implementation and Evaluation

The implemetation of the Cisc drawer is done in a single JavaScript class Cisc.js. This object allows a user to connect to an existing skipchain that was created using the CLI. Once the device is connected to a skipchain it will access a first set of functionalities:
- Access to the list of registered devices for the skipchain
- Possibility to browse the SSH-keys
- Possibility to browse the webpages stored on the skipchain

The device will have the possibility to submit a request to become a part of the registered devices. To do so it will propose a new block to the skipchain containing the same data as the one that are already on the chain, completed by a new entry in the device array. This entrt being its name and public key. If this block gets accepted, the device becomes registered and receive the right to vote for the proposed data.
The first thing to do when a user want to use the Cisc is to define a name in the parameters. Once this is done he will have the possibility to connect to a skipchain by using the button displayed in the drawer. When the button is tapped, the app turns into a QR code scanner. The QR scanner is expecting a QR formated as the one displayed using the command```cisc id qr```

After scanning such code, the object will save it and try to access it to get the data from the identity skipchain. If this action is successful, the object will consider itself as connected to the skipchain. It will then try to see wether or not the device is part of the voting devices of the chain. If it is not it will propose a new block of data to add it.
Once the device is part of the voting devices, it will have the ability to vote for the proposed data.
To vote for an update, the user has to compute a hash of the proposed data. This hash is computed based on every data in the block, that is:
- the threshold of the chain
- the devices name and public-keys alphabetically ordered
- the key-value pairs odered alphabetically
The vote then consists of a schnorr signature of this hash using the device private key, so that it is verifiable using the public key stored in the skipchain.

## Results
As shown in the previous part, the app only use the basic functionalities of the Cisc implementation. The most important task was to allow a user to access the cisc on all his devices and this project is a good proof of concept.However, we can still imagine some work to complete the application.

## Future Work

Some functionalities could improve the current implementation of the cisc. As example we can site the following:
- Adding the possibility to connect to multiple skipchains: indeed, right now a user can only be connected to a single identity skipchain. It could be a good thing to add an option to save a group of available skipchains that the user already connected to.
- Creating identity skipchains: indeed, for the moment the user has to connect to an already existing skipchain that was created using the cisc CLI. A good improvement of the app could be to add the possibility to connect to conode to create a skipchain, either using a public or even better, using the pop token generated on the other part of the application.

# PoP

As already stated in the introduction the backend for the PoP app is completely implemented in the Cothority framework, but requires technical knowledge because one has to use the CLI to handle the functionalities. The first and main goal was to provide a user friendly interface, packaged in a cross-platform app for Android and iOS, that would allow anyone to use the technology provided by PoP. In this section we will go through the implementation of PoP in CPMAC and the process of creating, handling, and finalizing a PoP party with the final PoP token creation.

## Implementation and Evaluation

Three main classes form the component for PoP, that is: PoP.js, Org.js and Att.js.
PoP.js is the object that handles everything that is common or shared by the organizers and the attendees of a PoP party e.g., the final statements and the PoP token they own. These are displayed in the PoP tab in the PoP drawer of the app. One can add a final statement by simply scanning a QR code provided by one of the organizers, delete a final statement, generate a PoP token by linking it with their key pair and revoke PoP token to get back the final statement. When revoking a PoP token the final statement is restored, one could now either generate the PoP token again by linking it with a key pair or delete the final statement. This has been implemented so that the user could change the key pair linked to the PoP token if a mistake has been made.
The process of sharing a final statement could not be achieved using only a QR code since the amount of data a code can contain is heavily restriced(https://en.wikipedia.org/wiki/QR_code#Storage). Because of this restriction we had to find a work around permitting organizers to share final satements with attendees. The current solution we propose is a third-party service called PasteBin(https://pastebin.com). This means that when someone wants to share a final statement and displays the QR code, it will first be uploaded to the PasteBin service, the QR code will then display the ID of the paste and the other person will then by scanning this code download the final statement from PasteBin. We have to add that this solution is not ideal and should only be temporary until a better one is implemented(see future works).
The next class is Att.js which is, as already stated before, only a skeleton for the class. At this point of developpement this class is empty and only a place holder for future implementations that will be specific to the attendee of a PoP party.
The last class is Org.js, this object is the most complicated one of the three as it has to handle every functionality an organizer needs to create, handle and finalize a PoP party. The first step for an organizer is to link itself with his conode. This can be achieved by clicking on the corresponding button in the org tab in the PoP drawer. The organizer can then choose to which conode he wants to link. The suggested conodes are the same one registered in the home page, so if the list is empty one should first register his conode in the home drawer and try to fetch the status of the conode to test if it is running correctly. By clicking on the wanted server, the organizer will be asked to enter the a PIN (found in the server logs). If the correct PIN has been entered the linked conodes name, description, public key and ID will be displayed in the org tab. This way, one always know to which conode he lastly linked (which is not a guarantee that the conode is still linked to the organizer). The displayed conode is the one contacted anytime a message needs to be sent. The next step will be to fill in the configuration of the PoP party. This can be done by clicking on the corresponding button which will open a new window. Simply enter the name, the date, the time and the location for the party. The last step of the configuration is to provide the roster used to host it. Either the organizer can enter each conode manually or he could simply scan the QR codes of the other organizers, wich is the more convenient way to do it. Once the organizer filled in the configuration he can easily share it with other organizers by displaying it as QR code. Here the same process as for final statements sharing is applied i.e., the configuration is uploaded to PasteBin before being shared. The other organizers could fill in the configuration too, but since those have to be exact copies (the only exception is the order of the conodes in the roster) the description sharing is highly recommanded. Once all the organizers have entered/imported the PoP party configuration they have to save it on their respective conodes, this will then return an ID that should be identical to every organizer. After registering, the ID of the current PoP description is displayed in the org tab just under the current linked conode. It is now used for all subsequent actions. The next step is to register all the attendees of the party. By clicking on the corresponding button in the org tab a new window is displayed. On this page the organizer can collect all the public keys that should be registered. As always, either the public keys are entered by hand or one could simply scan the QR code of the key pair. The order of the attendees is not important, however organizers have to all register the same list of public keys as the one that are not common to every conode will be stripped out. Once all public keys are registered locally, they can be sent to the conodes by clicking on the register button (this will finalize the PoP party on the respective conode). During this process, all organizers but the last one will receive an error message stating that not all other conodes are finalized. Everyone who received the error message can now go back to the org tab and fetch the final statement by clicking on the corresponding button (the last one to finalize the PoP party automatically fetched it). By switching to the PoP tab on should see the final statement. Organizers can now share this final statement with the attendees and everyone can generate their PoP token.
The linking process and registering the PoP configuration on the conode, i.e., generating the ID of the party, are two crucial steps. During the linking process the conode stores the public key of the organizer and will then only accept either messages that do not require a signature or signed messages that can be verified using it. The first signed message sent by the organizer is to register the PoP description. The ID is computed by hashing(in this paragraph we always talk about SHA-256, https://en.wikipedia.org/wiki/SHA-2) this description and the required signature along with the message is the ID signed using the Schnorr algorithm. The hash is computed by concatenating the strings of the name, the date and time, the location and then appending the "aggregate"(point addition) of all the public keys of the conodes that will host the PoP party. This forces the organizers to register exact copies of party configuration(excluding the order of the conodes, thanks to commutativity). The second and last signed message sent by the organizer is the finalizing request which includes all the registered attendees. The required signatures is the hash of the party ID concatenated with all the public keys of the attendees. If either the hashes are computed differently or signed using a private key that does not correspond to the public key stored on the conode, these messages will be rejected.

## Results

CPMAC is in it's first development phase. The core libraries have been implemented and currently only basic functionalities of CISC and PoP have been ported from the cothority framework. For the PoP part, CPMAC enables anyone wanting to host or attend a PoP party to create, manage, attend and finalize it. Moreover, it is possible to generate PoP tokens.
All these functionalities have been implemented to be as user friendly as possible and should be more accessible to the public in opposite to the CLI that Cothority provided until now.

## Future Work

As said in the result sub-section, only basic functionalities have been ported for now. But all the libraries and objects have been designed by keeping in mind that CPMAC will be extended by either providing CISC and PoP new functionalities or by even adding complete new Cothority apps like CoSi or Guard. Here I will list some possible future works:

- Replacing PasteBin:
  The PasteBin service is currently used to share PoP configurations because they contain too much data to be contained in a single QR code. This method relies on a third party, exposes data(not sensitive, but could not be wanted) on the internet and limits the shares as PasteBin only allows a certain amount of pastes per 24 hours depending on the status(guest, member, pro) used to create it. A solution that would lift all these restrictions would be to implement new fetch functionalities directly into the PoP app of the cothority framework. It is already possible to fetch the final statement from a conode by knowing it's ID, thus the same procedure could be used to fetch the PoP description corresponding to a certain ID. The new procedure would then require a first organizer to fill in the description, to register it on his conode, provide the others the ID and then the remaining organizers would simply fetch the description from the first organizers conode and register it on their own.

- PoP Party Merging:
  PoP parties can be merged. This means that people can organise multiple parties around the world and merge the final statements to be considered as a single PoP party. This is useful if the generated PoP tokens should have the same proof value but people have to meet at different places.

- Viral PoP Parties:
  Once a PoP party is finalized the final statement is registered on the hosting conodes. Moreover, all attendees listed in this statement are trusted people because they own a PoP token that is generated using it. Attendees should now be able to host a new PoP party on one of the hosting conodes using their PoP token as authentication (instead of linking to it by providing a PIN). This could ease the hosting of PoP parties as an attendee without having to set up a conode.

- Sign and Verify Services:
  One of the main purposes of a PoP token is to be able to sign and verify different services. The token allows us to prove that we were at a certain location at a certain date and time, thus it should provide us some rights that were linked to the PoP party. As an example we will use the BeerToken suggested by the DeDiS laboratory. The lab would organize a PoP party and invite all the DeDiS members. The goal of the PoP party is to hand out PoP tokens called BeerToken. A BeerToken would guarantee every attendee one free beer at Satellite(https://satellite.bar), the bar of EPFL. In order to make this possible it would be required to either verify a BeerToken, to know if the user already ordered is free beer of the week, or sign using a BeerToken to claim the weekly beer. All this could be implemented in CPMAC by extending the core libraries and objects.
