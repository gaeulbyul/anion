module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      },
      dist: {
        files: {
          'public/js/<%= pkg.name %>.min.js': ['public/js/<%= pkg.name %>.js'],
        },
      },
    },
    stylus: {
      compile: {
        options: {
          compress: true,
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        },
      },
      dist: {
        files: {
          'public/css/anion.css': 'public-src/css/anion.styl',
        },
      }
    },
    watch: {
      styluses: {
        files: ['public-src/css/*.styl'],
        tasks: ['stylus'],
        options: {
          spawn: false,
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  // grunt.registerTask('default', ['uglify', 'stylus']);
  grunt.registerTask('default', ['stylus']);

};

