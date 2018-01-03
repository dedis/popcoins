# Introduction of the subject and the problem

  - (OK)Some words about Cothority in general + diagram and state diagram
  - (TODO - CISC)Some details about CISC and (OK)PoP in general

# Goals of the project and motivation

  - (OK)Mostly/Completely? CLI for now
  - (OK)Difficult to access the functionalities of the Cothority framework
  - (OK)Want to make it more user friendly
  - (OK)Create a cross-platform app to ease the access to functionalities of the Cothority framework
  - (OK)Create an app/library that will be easily extensible for further functionalities of the Cothority
  - (OK)Make a PoC for CISC and PoP, make the technology available to everyone
  - (MAYBE BIT MORE???)Solution: Nativescript (explain why)

# Corresponding background

  - (OK)Define/Explain/Introduce Cothority
  - (TODO)Define/Explain/Introduce CISC
  - (MAYBE BIT MORE???)Define/Explain/Introduce PoP (define important terms: key pair, link, pop party, org, att, config, register, final, pop token...)
  - (OK)A bit of Elliptic Curve Cryptography? (addition instead of multiplication)
  - (OK)A bit of Schnorr Signature Generation and Verification? (Including hashes)
  - (OK)A bit of Protobuf?
  - (OK)A bit of Websocket?

# Step-by-step description of your design/implementation/evaluation/analysis

  - (OK)Global structure of the app
  - (OK)Explain library structure: protobuf, Net, Crypto, Convert....
  - (OK)Explain object structure: User, CISC/PoP{Org, Att}...
  - (MAYBE BIT MORE???)Talk about implementation choices

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

    - (OK)PoP backend is fully implemented
    - (OK)Need to implement a user friendly frontend
    - Implementation of the communication between PoP front- and backend
      - Messages, Signing...
      - Talk about the hash/sign functions/algo used internally by the organizer
    - (OK)Talk about their possibilities
      - (OK)Organizer: Configure, Register, Finalize
      - (OK)Attendee: keypair, PoP Token creation
    - (OK)Explain/Demo a complete workflow of organising/attending a PoP party

  ## Results

    - Ability to create, manage, attend a PoP party
    - PoP Token creation at the finalisation of the PoP party

  ## Future work

    - Config sharing over the conodes and not pastebin
    - Sign/Verify Services (Ex. BeerToken)
    - Party Merging
    - Viral PoP Parties: Register a final statement on a conode, everyone in the final should be able to either create a skipchain or new pop party

# Step-by-step guide for installation, including dependencies, and running of the final product

  - Nativescript Tutorial
  - Install Node, VS Code or Webstorm, Plugins
  - Android Studio - Emulator / Xcode - Emulator - debugging on device
  - Own Makefile scripts (typically compile dedjs/protobuf)
  - Install and run conodes
  - Explain how to build/test
  - Talk about the bugs we had to bypass (.gz, brorand, websocket?...)
  
# What have we learned? What would we now do differently?

  - 12 janvier rapport + app! (send 8 janvier si "correction")
  - 23 janvier demo 11h40 - BC229
