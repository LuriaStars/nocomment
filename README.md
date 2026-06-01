# NoComment
[CAUSE I'D RATHER HAVE 500 LINES INSTEAD OF 5000]


Toggle comment visibility in any file. Comments collapse out of view, it was bugging me.

## how to use it

| Action | How |
|---|---|
| Toggle comments | `Ctrl+Alt+/` (when editor is focused). You can change this obviously.
| Toggle via mouse | You can click the little eye in the status bar, because god knows I've forgotten that I had my comments disabled. |
| Toggle via palette | `Ctrl+Shift+P` → `NoComment: Toggle Comments` | This is mainly for debug purposes when you screw up your keybindings

The status bar item reflects the state of whichever file is active so if you switch tabs, it updates.

## Languages supported

JavaScript, TypeScript, JSX, TSX, Python, Rust, C, C++, Java, Go, C#, Swift, Kotlin, HTML, XML, CSS, SCSS, Less, Lua, Haskell, SQL, Shell, Fish, YAML, TOML, Dockerfile, Ruby, R, Markdown, and anything else falls back to `//` and `/* */`.
If your language is not supported then fork it and add it, I know maybe 5 of these languages, I tried getting in all types of propietary comment syntax that I could find.

## Changing the keybinding

Open the Keyboard Shortcuts editor (`Ctrl+K Ctrl+S`), search for `nocomment.toggle`, and reassign it. The default only fires when a text editor is focused WHICH IS intentional, otherwise the shortcut would compete with other panels.


## Known limitations

- Detection is syntax-aware but not really semantic it uses a state machine that tracks strings and comments, so it handles most real-world code correctly. Edge cases like Python triple-quoted strings used as docstrings may not be detected all the time (wth is wrong with you??)
- Comments hidden this way are invisible, not deleted. THIS IS A NON DESTRUCTIVE EXTENSION
- Also, bear this in mind: if you want it to act as well, when the editor is not focused (meaning global), you wont be able to do it 100% perfectly, since most of the time you are gonna be inside a webview container, making this an issue with vscode primarily.


## License

Public domain. Do whatever you want with it, idfc, I had an hour to spare and all the comments AI add to code is just annoying most of the time, I mainly use this extension for refactoring or for when I actually don't know wtf is the code doing.
