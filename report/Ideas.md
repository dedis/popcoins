# Introduction of the subject and the problem

  - Some words about Cothority in general
  - Some details about CISC and PoP in general

# Goals of the project and motivation

  - Mostly/Completely? CLI for now
  - Difficult to access the functionalities of the Cothority framework
  - Want to make it more user friendly
  - Create a cross-platform app to ease the access to functionalities of the Cothority framework
  - Create an app/library that will be easily extensible for further functionalities of the Cothority
  - Make a PoC for CISC and PoP, make the technology available to everyone
  - Solution: Nativescript

# Corresponding background

  - Define/Explain/Introduce Cothority
  - Define/Explain/Introduce CISC
  - Define/Explain/Introduce PoP
  - A bit of Elliptic Curve Cryptography?
  - A bit of Schnorr Signature Generation and Verification? (Including hashes)
  - A bit of Protobuf?
  - A bit of Websocket?

# Step-by-step description of your design/implementation/evaluation/analysis

  - Explain library structure: protobuf, Net, Crypto, Convert....
  - Explain object structure: User, CISC/PoP{Org, Att}...

# CISC:

  ## Theoretical and practical limitations of the project and its implementation

  ## Results

  ## Evaluation of the results and comparison with other approaches if applicable

  ## Future work

# PoP:

  ## Theoretical and practical limitations of the project and its implementation

    - PoP backend is fully implemented
    - Need to implement a user friendly frontend
    - Implementation of the communication between PoP front- and backend
      - Messages, Signing...
    - Define terms like Organizer, Attendee
    - Talk about their possibilities
      - Organizer: Configure, Register, Finalize
      - Attendee: keypair, PoP Token creation
    - Explain/Demo a complete workflow of organising/attending a PoP party
    - Talk about the hash/sign functions/algo used internally by the organizer

  ## Results

    - Ability to create, manage, attend a PoP party
    - PoP Token creation at the finalisation of the PoP party

  ## Evaluation of the results and comparison with other approaches if applicable

  ## Future work

    - Sign/Verify Services
    - Party Merging

# Step-by-step guide for installation, including dependencies, and running of the final product

  - Nativescript Tutorial
  - Install Node, VS Code or Webstorm, Plugins
  - Android Studio - Emulator / Xcode - Emulator
  - Own Makefile scripts (typically compile dedjs/protobuf)
  - Install and run conodes
  - Explain how to build/test
  - Talk about the bugs we had to bypass (.gz, brorand...)
