# universal-sanitizer

[![npm version](https://img.shields.io/npm/v/universal-sanitize.svg)](https://www.npmjs.com/package/universal-sanitizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A universal key & value sanitizer for **MongoDB, SQL, Redis, and Elasticsearch** payloads.  
Designed to reduce common injection risks by stripping dangerous keys and values.

⚠️ Not a replacement for parameterized queries or ORM validation.

---

## 🚀 Installation

npm install universal-sanitize

## 🛠 Usage

import { sanitize } from "universal-sanitize";

const clean = sanitize({ username: { $gt: "" } }, { backend: "mongo" });
console.log(clean); // { username: {} }

## Custom Adapter

import { register } from "universal-sanitize";

register("mydb", {
forbiddenKeys: [/^\$/],
keyReplace: /[^a-z0-9_]/gi,
sanitizeValue: v => (typeof v === "string" ? v.trim() : v),
stripUnknownTypes: true,
});

## ✅ Backends

MongoDB → strips $ operators, . in keys, blocks **proto**

SQL → removes quotes, semicolons, comments, parentheses

Redis → strips CRLF and binary payloads

Elasticsearch → strips dangerous script fields

## 🧪 Testing

npm run test

## 🤝 Contributing

PRs are welcome! Please run lint & tests before submitting.
