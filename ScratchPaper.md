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

# Introduction

As the CISC and PoP app are completely implemented and functional in the backend only, it is difficult for casual users to use these technologies without investing a lot of time in the hand-on process of creating and running a conode. The main purpose of this semester project was to lift this restriction and bring these technologies to the casual and non technical user. If you wanted to store data in an identity skipchain or hold a PoP party you had to use the command line interface (CLI) which is really impractical and difficult to use. Giving the end user an easy way to access the Cothority framework functionalities is a crucial part when bringing new technologies to the mass(or public?).

Almost everyone owns a smartphone, be it an Android device or an iPhone, pretty much everbody has one in their pocket. The idea was to create a cross-platform mobile application for the Cothority, thus make the functionalities accessible to almost everyone and as user friendly as possible.
