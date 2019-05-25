module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        screwIE8: true,
      },
      dist: {
        files: {
          'public/js/anion.min.js': ['public-src/js/anion.js'],
        },
      },
    },
    stylus: {
      compile: {
        options: {
          compress: true,
        },
      },
      dist: {
        files: {
          'public/css/anion.css': 'public-src/css/anion.styl',
        },
      },
    },
    watch: {
      styluses: {
        files: ['public-src/css/*.styl'],
        tasks: ['stylus'],
        options: {
          spawn: false,
        },
      },
      scripts: {
        files: ['public-src/js/*.js'],
        tasks: ['uglify'],
        options: {
          spawn: false,
        },
      },
    },
  })

  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-stylus')
  grunt.registerTask('default', ['uglify', 'stylus'])
}
