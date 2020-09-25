import React, { useState, useEffect } from "react";

import nimmsync from "nimm-sync";

const io = require("socket.io-client");
const client = io.connect("http://localhost:3001");

const con = nimmsync.connectSocketIOClient(client, React);

export const { useStream, useMessageStream } = con;

export function useOpenStream(key, at) {
  const directHooks = ["user", "users"];
  if (directHooks.indexOf(key) > -1) throw "work with direct hooks";

  return con.useOpenStream(key, at);
}

export function useUser(username) {
  const [user, opts] = con.useOpenStream("user", username);
  const { on: on_users } = useMessageStream("users");

  on_users("updateMember", ([u]) => u === username && opts.get());

  return [user, opts];
}
export function useUsers() {
  const [users, opts] = con.useOpenStream("users");

  opts.on("updateMember", ([u]) => opts.get());

  return [users, opts];
}
