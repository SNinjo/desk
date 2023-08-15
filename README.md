<p align="center">
    <img width="100" src="https://github.com/SNinjo/desk/blob/master/public/icons/desk.png" alt="Desk logo">
</p>
<p align="center">
    <span style="color: white; font-size: 30px">Desk</span>
</p>
<p align="center">
    <a href="https://github.com/SNinjo/desk/blob/main/LICENSE">
        <img src="https://img.shields.io/badge/license-Apache-blue" alt="License">
    </a>
    <a href="https://github.com/SNinjo/desk/releases/tag/v1.0.0">
        <img src="https://img.shields.io/badge/extension-v1.0.0-blue" alt="Extension">
    </a>
</p>

<hr/>
Desk is a Chrome Extension that provides enhanced bookmark functionality.
<br/><br/>
This tool can simplify a lot of daily routine on the website and also provides an API to customize your own units, all (bookmark) buttons is named "unit".
<br/>
It can automatically do something after opening a website and provide a global variable that named "keep" to easily change properties in URL or a variables in the code.
<br/>
By the way, hope this tool can open any website you want with just one click.


## Examples
<b>CopyRight</b>: There are some youtube channels or e-commerce stores in example. If it had any problem, please post a question in [issue](https://github.com/SNinjo/desk/issues) and we'll deal with (maybe delete) it right away. We're very sorry about it.

#### Youtube &middot; [download](https://github.com/SNinjo/desk/tree/youtube)
Follow some youtuber or youtube channel for latest video.
Keep represents whether to open latest video, fill in "true".

#### Online Store (Singapore) &middot; [download](https://github.com/SNinjo/desk/tree/onlineStore)
Search for products in different online stores.
Keep represents the name of the product you are searching for.


## Usage
1. Click or trigger shortcut key on unit to open target website. (When mouse hover over unit, it shows its name and shortcut key.)
2. Fill in keep and click on unit to open target website with a special variable.

#### Shortcut Key for Keep
| Shortcut Key | Description                     				       |
| ------------ | ----------------------------------------------------- |
| alt + z      | Clear the value of "keep".      				   	   |
| alt + x      | Select the inner text of a tag on the html as "keep". |
| alt + c      | Copy the value of "keep".        				   	   |
| alt + v      | Paste the value to "keep".        				   	   |


## Installation
#### Extension (has already built)
1. Download the code.
2. Open google chrome.
3. Open extensions using chrome://extensions
4. Enable developer mode.
5. Click on Load Unpacked and select the unzip folder you just downloaded.
6. Desk will be installed now.

#### Extension (not yet build)
1. Download the code.
2. Open CLI and input following command
```
npm run build
```
3. Open google chrome.
4. Open extensions using chrome://extensions
5. Enable developer mode.
6. Click on Load Unpacked and select the folder named "build" in unzip folder you just downloaded.
7. Desk will be installed now.


## API
Customize your own units, all (bookmark) buttons is called "unit".  
#### Unit (in /unit/index.json):
| Attribute     | Type      | Description                                                                                                                    |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| name          | string    | Define the unit name displayed under the icon.                                                                                 |
| icon          | file path | Specify the file path of icon. The root directory is /unit/icon/ .                                                             |
| key           | Key       | Define the shortcut key for clicking it.                                                                                       |
| link          | URL       | Specify the target URL when keep isn't used.                                                                                   |
| code          | file path | Specify the code run automatically after opening the URL (link) when keep isn't used. The root directory is /unit/codes/ .     |
| linkUsingKeep | URL       | Specify the target URL when using keep.                                                                                        |
| codeUsingKeep | file path | Specify the code run automatically after opening the URL (linkUsingKeep) when using keep. The root directory is /unit/codes/ . |

#### Key (in Unit):
| Attribute | Type    | Description                                                                      |
| --------- | ------- | -------------------------------------------------------------------------------- |
| code      | string  | Define the main shortcut key. This value is same as KeyboardEvent.code.          |
| alt       | boolean | Defines whether to detect pressing alt key when the shortcut key is triggered.   |
| ctrl      | boolean | Defines whether to detect pressing ctrl key when the shortcut key is triggered.  |
| shift     | boolean | Defines whether to detect pressing shift key when the shortcut key is triggered. |

#### Constant/ Method (in /unit/codes/*.js):  
Provides useful constants and methods that can be called directly in code.
| Constant | Type   | Description                          						  |
| -------- | ------ | ----------------------------------------------------------- |
| link     | string | Get the value of "link" or "linkUsingKeep" set on the unit. |
| code     | string | Get the value of "code" or "codeUsingKeep" set on the unit. |
| keep     | string | Get the value of "keep" set on desk. 						  |

| Method                                | Return Type | Description                                                       |
| ------------------------------------- | ----------- | ----------------------------------------------------------------- |
| done()                                | void        | Let the extension to stop running code automatically on this tab. |
| open(link: URL, code: string)         | void        | Open the website on a new tab and run the specified code. 	  	  |
| sleep(ms: number)                     | void        | Wait for the time you set.                                        |
| until(check: Function, run: Function) | void        | Run the code after waiting for the check.                         |


## License
Desk is [Apache licensed](./LICENSE).
