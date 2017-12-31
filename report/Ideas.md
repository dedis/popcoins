# Introduction of the subject and the problem

  - (OK)Some words about Cothority in general + diagram and state diagram
  - (PARTIALLY)Some details about CISC and (OK)PoP in general

# Goals of the project and motivation

  - (OK)Mostly/Completely? CLI for now
  - (OK)Difficult to access the functionalities of the Cothority framework
  - (OK)Want to make it more user friendly
  - (OK)Create a cross-platform app to ease the access to functionalities of the Cothority framework
  - Create an app/library that will be easily extensible for further functionalities of the Cothority
  - Make a PoC for CISC and PoP, make the technology available to everyone
  - Solution: Nativescript (explain why)

# Corresponding background

  - Define/Explain/Introduce Cothority
  - Define/Explain/Introduce CISC
  - Define/Explain/Introduce PoP (define important terms: org, att, config, final, pop token...)
  - A bit of Elliptic Curve Cryptography? (addition instead of multiplication)
  - A bit of Schnorr Signature Generation and Verification? (Including hashes)
  - A bit of Protobuf?
  - A bit of Websocket?

# Step-by-step description of your design/implementation/evaluation/analysis

  - Explain library structure: protobuf, Net, Crypto, Convert....
  - Explain object structure: User, CISC/PoP{Org, Att}...

# CISC:

  ## Theoretical and practical limitations of the project and its implementation
    - Cisc backend is implemented
    - Implementation of an app to allow users to vote on modifications and propose key pairs
      - Users can have a skipchain to store key pairs/webpages
      - Having more devices increase the security (possibility to reach the threshold to remove lost devices ...)
    - Implementation of the communication between CISC front- and backend
      - Messages, Signing...
    - Show how to use the app to propose key pairs, to vote, to remove keypairs

  ## Results

    - Possibility to connect to a id
    - Possibility to add the device to the id
    - Possibility to propose key pairs, to vote for new data
    - Possibility to access the webpages stored on the cisc keypair

  ## Future work

    - Have multiple identities
    - Creating identity skipchains using the pop token from the other side of the app as auth


# PoP:

  ## Theoretical and practical limitations of the project and its implementation

    - PoP backend is fully implemented
    - Need to implement a user friendly frontend
    - Implementation of the communication between PoP front- and backend
      - Messages, Signing...
    - Define terms like Organizer, Attendee (recall)
    - Talk about their possibilities
      - Organizer: Configure, Register, Finalize
      - Attendee: keypair, PoP Token creation
    - Explain/Demo a complete workflow of organising/attending a PoP party
    - Talk about the hash/sign functions/algo used internally by the organizer

  ## Results

    - Ability to create, manage, attend a PoP party
    - PoP Token creation at the finalisation of the PoP party

  ## Future work

    - Sign/Verify Services (Ex. BeerToken)
    - Party Merging
    - Register a final statement on a conode, everyone in the final should be to do either create a skipchain or new pop party

# Step-by-step guide for installation, including dependencies, and running of the final product

  - Nativescript Tutorial
  - Install Node, VS Code or Webstorm, Plugins
  - Android Studio - Emulator / Xcode - Emulator - debugging on device
  - Own Makefile scripts (typically compile dedjs/protobuf)
  - Install and run conodes
  - Explain how to build/test
  - Talk about the bugs we had to bypass (.gz, brorand...)
  
# What have we learned? What would we now do differently?

  - 12 janvier rapport + app! (send 8 janvier si "correction")
  - 23 janvier demo 11h40 - BC229
