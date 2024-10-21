import os
import sys

# Only imports for modules distributed as part of the standard Python library may go above this line.
# All other imports will result in module not found exceptions on the frozen macOS build.
if sys.platform == "darwin" and getattr(sys, 'frozen', False):
    for i in range(len(sys.path)):  # signed code can't contain python modules
        sys.path.append(sys.path[i].replace("MacOS", "Resources"))

import regex as re

from arelle.SocketUtils import INTERNET_CONNECTIVITY, OFFLINE, warnSocket
from arelle.BetaFeatures import BETA_OBJECT_MODEL_FEATURE, enableNewObjectModel
from arelle import CntlrCmdLine, CntlrComServer

def convert(args):
    internetConnectivityArgPattern = rf'--({INTERNET_CONNECTIVITY}|{INTERNET_CONNECTIVITY.lower()})'
    internetConnectivityArgRegex = re.compile(internetConnectivityArgPattern)
    internetConnectivityOfflineEqualsRegex = re.compile(f"{internetConnectivityArgPattern}={OFFLINE}")
    prevArg = ''
    for arg in args:
        if (
                internetConnectivityOfflineEqualsRegex.fullmatch(arg)
                or (internetConnectivityArgRegex.fullmatch(prevArg) and arg == OFFLINE)
        ):
            warnSocket()
            break
        prevArg = arg

    # Model transition must be enabled before any other imports to avoid mixing base classes.
    if f"--{BETA_OBJECT_MODEL_FEATURE}" in args or f"--{BETA_OBJECT_MODEL_FEATURE.lower()}" in args:
        enableNewObjectModel()

    if '--COMserver' in args:
        CntlrComServer.main()
    elif __name__.startswith('_mod_wsgi_') or os.getenv('wsgi.version'):
        application = CntlrCmdLine.wsgiApplication()
    elif __name__ in ('__main__', 'arelleCmdLine__main__', 'arellecmdline__main__','arelle_fun'): #cx_Freeze 5 prepends module name to __main__
        os.environ["ARELLE_ARGS"] = ' '.join(args)
        print(os.getenv("ARELLE_ARGS"))

        CntlrCmdLine.main()
        #CntlrCmdLine.main()

if __name__ == "__main__":

    file_path = r'D:/_OpenEarth/Arelle_server_standalone'
    command = ['-f', f'{file_path}/apple.zip',
            '--plugins', 'validate/EFM|saveLoadableOIM',
            f'--saveLoadableOIM={file_path}/file.json']

    convert(command)