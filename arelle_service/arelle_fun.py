import os
import sys
import logging

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

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
    logger.debug("convert() called")
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
        logger.debug("Enabling new object model")
        enableNewObjectModel()

    if '--COMserver' in args:
        logger.debug("Turning on com server")
        CntlrComServer.main()
    elif __name__.startswith('_mod_wsgi_') or os.getenv('wsgi.version'):
        logger.debug("Turning on wsgi application")
        application = CntlrCmdLine.wsgiApplication()
    elif __name__ in ('__main__', 'arelleCmdLine__main__', 'arellecmdline__main__','arelle_fun'): #cx_Freeze 5 prepends module name to __main__
        logger.debug("running command line")
        os.environ["ARELLE_ARGS"] = ' '.join(args)
        logger.debug(os.getenv("ARELLE_ARGS"))

        logger.debug("Calling main")

        CntlrCmdLine.main()

        logger.debug("main() finished")
