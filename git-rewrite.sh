#!/bin/bash

# === CONFIGURE THESE ===
NEW_NAME="eooo"
NEW_EMAIL="dev@eooo.io"

# === Run the filter ===
git filter-branch --env-filter '

OLD_EMAIL=$(git config user.email)

export GIT_AUTHOR_NAME="'"$NEW_NAME"'"
export GIT_AUTHOR_EMAIL="'"$NEW_EMAIL"'"
export GIT_COMMITTER_NAME="'"$NEW_NAME"'"
export GIT_COMMITTER_EMAIL="'"$NEW_EMAIL"'"

' --tag-name-filter cat -- --branches --tags

echo "🎉 All commits have been rewritten with: $NEW_NAME <$NEW_EMAIL>"

