import React, { useState, useEffect } from "react";

import nimmsync from "nimm-sync";

const io = require("socket.io-client");
const client = io.connect("http://localhost:3001");

export const { useStream, useOpenStream, useMessageStream } = nimmsync.connectSocketIOClient(client, React);
