#!/usr/bin/env node

/**
 * Capture Environment Info
 * 
 * Outputs environment information for benchmark runs.
 * No network calls - all local data.
 * 
 * Usage:
 *   node tools/capture-env.js
 *   npm run benchmark:env
 */

const { execSync } = require('child_process');
const os = require('os');

/**
 * Safely execute a command and return output or fallback
 * @param {string} command 
 * @param {string} fallback 
 * @returns {string}
 */
function safeExec(command, fallback = 'unknown') {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return fallback;
  }
}

/**
 * Get current git commit hash (short)
 * @returns {string}
 */
function getGitCommit() {
  return safeExec('git rev-parse --short HEAD', 'no-git');
}

/**
 * Get current git branch
 * @returns {string}
 */
function getGitBranch() {
  return safeExec('git branch --show-current', 'no-git');
}

/**
 * Check if working directory is clean
 * @returns {string}
 */
function getGitStatus() {
  const status = safeExec('git status --porcelain', '');
  return status === '' ? 'clean' : 'dirty';
}

/**
 * Format date as ISO string (local time)
 * @returns {string}
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

// Gather all environment info
const info = {
  timestamp: getTimestamp(),
  node: process.version,
  npm: safeExec('npm --version'),
  os: `${os.platform()} ${os.release()}`,
  arch: os.arch(),
  git: {
    commit: getGitCommit(),
    branch: getGitBranch(),
    status: getGitStatus(),
  },
};

// Output as formatted block (for pasting into markdown)
const output = `
Environment Snapshot
--------------------
Timestamp:  ${info.timestamp}
Node:       ${info.node}
npm:        ${info.npm}
OS:         ${info.os}
Arch:       ${info.arch}
Git Commit: ${info.git.commit}
Git Branch: ${info.git.branch}
Git Status: ${info.git.status}
`.trim();

console.log(output);
