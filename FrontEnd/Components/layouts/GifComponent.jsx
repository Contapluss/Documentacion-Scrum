function LoadingGif({ GifSource, alt }) {
    // los datos tiene que entrar de la siguiente forma
    //<LoadingGif GifSource={errorGif} alt="Pan saliendo del portal" />
    return (
        <img
            src={GifSource} // ¡Ahora sí recibe el valor correcto!
            alt={alt}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            }}
        />
    );
}

export default LoadingGif;