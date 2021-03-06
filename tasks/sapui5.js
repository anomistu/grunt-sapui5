/*
 * grunt-sapui5
 * https://github.com/pplenkov/grunt-sapui5
 *
 * Copyright (c) 2017 theplenkov
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  'use strict';

  //load SAP task
  grunt.loadNpmTasks('@sap/grunt-sapui5-bestpractice-build');

  // merging function
  var mergeWith = require('lodash.mergewith');
  var customizer = function (objValue, srcValue) {
    if (Array.isArray(objValue)) {
      return [srcValue].concat(objValue);
    }
  };


  // read config
  var oConfig = grunt.config();

  try {
    // read manifest.json
    var oManifest = grunt.file.readJSON(oConfig.dir.webapp || oConfig.dir.appFolder + "/manifest.json");

    // take sap.app version
    var oApp = oManifest["sap.app"];
    var oUI5 = oManifest["sap.ui5"];

    var sVersion = (oUI5 && oUI5.dependencies && oUI5.dependencies.minUI5Version) ? oUI5.dependencies.minUI5Version.substring(0, 4) : "1.38";

    if (oApp) {
      switch (oApp.type) {

        // updating compatible version for proper build
        case "application":

          mergeWith(oConfig,
            {
              openui5_preload: {
                preloadTmp: {
                  options: {
                    compatVersion: sVersion
                  }
                }
              },
            }, customizer
          );

          break;

        // for libraries we should create library.json
        case "library":

          // a.b.c -> a/b/c
          var sRoot = oConfig.dir.root.split(".").join("/");

          mergeWith(oConfig,
            {

              openui5_preload: {
                preloadTmp: {
                  options: {
                    compatVersion: sVersion,
                    resources: {
                      prefix: sRoot
                    },
                  },
                  libraries: true
                }
              },
              copy: {
                copyTmpToDist: {
                  files: [
                    {
                      expand: true,
                      src: '**/library.js',
                      dest: oConfig.dir.dist,
                      cwd: oConfig.dir.tmpDir

                    }
                  ]
                }
              }
            }, customizer
          );

          break;

        default:
          break;
      }
    }

  } catch (error) {

  }

  // // ToDo: replace with find function
  // var bHasComponents = true;
  // if (bHasComponents) {
  //   mergeWith(oConfig,
  //     {
  //       copy: {
  //         copyTmpToDist: {
  //           files: [
  //             {
  //               expand: true,
  //               src: '**/Component.js',
  //               dest: oConfig.dir.dist,
  //               cwd: oConfig.dir.tmpDir
  //             }
  //           ]
  //         }
  //       }
  //     }, customizer
  //   );
  // }

  grunt.config("openui5_preload", oConfig.openui5_preload);
  grunt.config("copy", oConfig.copy);

  grunt.registerTask('default', [
    'lint',
    'clean',
    'build'
  ]);
};
