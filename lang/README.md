# Note
This is my first time ever doing something like this, so feedback is very much appreciated

## Setting up the coding stuff
First things first, make a fork of PlayerTube from the main page of the repo & download your fork of it using:
```bash
git clone https://github.com/[GITHUB-USER]/PlayerTube.git
```
Once done downloading, open the `PlayerTube` folder & navigate to the `lang` folder. If your language does not exist, go to "**Creating a new language folder**". Else, go to "**Editing a language folder**".

To load the extension from your forked version, you can use a blank profile on something like Chromium to load the extension for testing your changes.

## Creating a new language folder
1. Copy the `en` from the `lang` folder. Name this copy to the language code (`ISO 639-1`) of the language you'll be creating.
2. Before going in the language folder you created, open the `index.json` folder at the root of the `lang` folder.
3. In the list of language codes, add a `,` at the end of the last string--the line with `"`'s around it--make a new line with the language code you used.

Alright, now let's give the language some data needed to display on PlayerTube.

4. Hop into the language folder you created & open the `index.json` file with any text editor.
5. Change the display name to your language's name in said language & also add a English translation at the end of it in round brackets.
    * For example: `Español (Spanish)`, `한국어 (Korean)`, `Русский (Russian)`
        * Side-note, I think a good amount of russian people use this extension.
6. Remove `ktg5` from the list of `authors` & add yourself.
7. You may change the version number if you'd like, but I (ktg5) will be managing this myself.

Great! Need you gotta do the actual translation stuff.

## Editing a language folder
`index.json`:
* This is where basic details about the language are--display-name within settings, author names, and a version number.
* When making changes to a language, make sure to add yourself to the list of authors!
* Also you don't need to change the version number if you're lazy--I (ktg5) can do that.

`settings.json`:
* Each option has a object of two variables with strings (aka text). Those variables being `title` & `desc`. Edit the string values of each option.
* Some options may not have a `desc` variable, which is fine--you can add one yourself if it's needed to explain the option for your language.

Once the language folder is at a state where you'd like to share it, please send in a pull request and I'd be happy to take a look at it! Thanks so much!
