var gulp = require('gulp'),
    pug = require('gulp-pug'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    plumber = require('gulp-plumber'),
    htmlmin = require('gulp-html-minifier'),
    uglify = require('gulp-uglify'),
    prettify = require('gulp-jsbeautifier'),
    gulpif = require('gulp-if'),
    concat = require('gulp-concat'),
    rmdir = require('rmdir');

/* ------------------------ Directory Settings ---------------------- */
var devPath = 'src',
    pugPath = devPath + "/pug",
    sassPath = devPath + "/sass",
    devCssPath = devPath + "/css",
    devJsPath = devPath + "/js",
    devImgPath = devPath + "/images",
    devVendorPath = devPath + "/vendor";
var destPath = "dest",
    cssPath = destPath + "/assets/css",
    imgPath = destPath + "/assets/images",
    jsPath = destPath + "/assets/js";
vendorPath = destPath + "/assets/vendor";

/* ------------------------ task config Settings ---------------------- */
var portNumber = 8001; /* port for browserSync UI */
var minification = true; /* set to false if output showld not be minified html,css,js */
var sassSettings = {
    outputStyle: minification? 'compressed' : 'expanded',
    onError: browserSync.notify
};
var pugSettings = {
    pretty: true
};
var autoprefixerSettings = {
    browsers: ['last 35 versions'],
    cascade: false
};
var browserSyncSettings = {
    reloadDebounce: 1000,
    server:
    {
        baseDir: destPath
    },
    ui:
    {
        port: portNumber
    }
};
var uglifySettings = {
    sequences: true,
    dead_code: true,
    drop_debugger: true,
    conditionals: true,
    booleans: true,
    loops: true,
    evaluate: true,
    unused: true,
    if_return: true,
    join_vars: true,
    cascade: true,
    drop_console: true
};
var htmlSettings = {
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    minifyURLs: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true
};
var plumberSettings = function(error)
{
    console.log(error);
    this.emit('end');
}

/* ------------------------ Exprn match ---------------------- */
var htmlmatch = [
        destPath + "/*.html"
    ],
    pugmatch = [
        pugPath + "/**/*.pug", '!' + pugPath + '/**/_*/**/*'
    ],
    sassmatch = [
        sassPath + "/**/*.sass",
        sassPath + "/**/*.scss", '!' + sassPath + '/**/_*/**/*'
    ],
    sassallmatch = [
        sassPath + "/**/*.sass",
        sassPath + "/**/*.scss"
    ],
    jsmatch = [
        devJsPath + "/**/*.js", "!" + devJsPath + "/**/*.min.js", '!' +
        devJsPath + '/**/_*/**/*'
    ],
    imgmatch = [devImgPath + '/**/*'],
    vendormatch = [devVendorPath + '/**/*'],
    pugallmatch = [pugPath + "/**/*.pug"];
jsallmatch = [devJsPath + "/**/*.js"];
cssallmatch = [devCssPath + "/**/*.css"];
allmatch = [devPath + '/**/*'];

/* ------------------------ Vendor Copy  ---------------------- */
gulp.task('vendor', function()
{
    return gulp.src(vendormatch)
        .pipe(plumber(plumberSettings))
        .pipe(gulp.dest(vendorPath))
});

/* ------------------------ sass  task ---------------------- */
gulp.task('sass', function()
{
    return gulp.src(sassmatch)
        .pipe(plumber(plumberSettings))
        .pipe(sass(sassSettings))
        .on('error', function(e)
        {
            console.log(e);
        })
        .pipe(autoprefixer(autoprefixerSettings))
        .pipe(gulp.dest(cssPath))
        .pipe(browserSync.reload(
        {
            stream: true
        }))
        .pipe(gulp.dest(devCssPath))
});

/* ------------------------ pug  task ---------------------- 
 *
 *   Compile pug files to html
 *
 **/
gulp.task('pug', function()
{
    return gulp.src(pugmatch)
        .pipe(plumber(plumberSettings))
        .pipe(pug(pugSettings))
        .pipe(gulpif(minification === true, htmlmin(
            htmlSettings)))
        .pipe(gulp.dest(destPath))
});

/* ------------------------ js  task ---------------------- */
gulp.task('scripts', function()
{
    return gulp.src(jsmatch)
        .pipe(plumber(plumberSettings))
        .pipe(concat('scripts-bundle.js'))
        .pipe(rename('scripts.min.js'))
        .pipe(gulpif(minification === true, uglify(
            uglifySettings)))
        .pipe(gulpif(minification === false, prettify()))
        .pipe(gulp.dest(jsPath))
});

/* ------------------------ image min  task ---------------------- */
gulp.task('imgmin', function()
{
    return gulp.src(imgmatch)
        .pipe(plumber(plumberSettings))
        .pipe(gulpif(minification === true, imagemin()))
        .pipe(gulp.dest(imgPath))
});

/* ------------------------ browserSync  task ---------------------- */
gulp.task('browser-sync', ['sass', 'scripts', 'imgmin', 'pug'],
    function()
    {
        return browserSync(browserSyncSettings);
    });

/* ------------------------ Clean  task ---------------------- */
gulp.task('clean', function()
{
   return rmdir(destPath, function (err, dirs, files) {
      console.log(dirs);
      console.log(files);
      console.log('all files are removed');
    });

});

/* ------------------------ Clean  task ---------------------- */
gulp.task('build', function()
{
    console.log("build started");
    minification = true;
    sassSettings.outputStyle = 'compressed';
   // gulp.start('clean');
    gulp.start('vendor');
    gulp.start('sass');
    gulp.start('imgmin');
    gulp.start('scripts');
    gulp.start('pug');
    console.log("build finished");
});

/* ------------------------  watch  task -------------------------- */
gulp.task('watch', function()
{
    gulp.watch(sassallmatch, function(event){
        gulp.start('sass');
    });
    gulp.watch(imgmatch, function(event){
        gulp.start('imgmin');
    });
    gulp.watch(jsmatch, function(event){
        gulp.start('scripts');
    });
    gulp.watch(pugallmatch, function(event){
        gulp.start('pug');
    });
    gulp.watch(allmatch)
        .on('change', browserSync.reload);
});

/* ------------------------ default gulp task -------------------------- */
gulp.task('default', ['clean', 'vendor', 'browser-sync', 'watch']);