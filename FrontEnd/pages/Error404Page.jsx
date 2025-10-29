import errorGif from '../assets/tf2-bread.gif'; // Importa el GIF
import LoadingGif from '../Components/layouts/GifComponent'

function Error404Page() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffffff'
      }}
    >
      <h1 className="mb-4">Error 404 - Página no encontrada</h1>
      <div style={{
        width: '300px',
        height: '300px',
        margin: '20px auto'
      }}>
        <LoadingGif GifSource={errorGif} alt="Pan saliendo del portal" />
      </div>
      <p className="mt-3">La página que estás buscando no existe o fue movida</p>
    </div>
  );
}

export default Error404Page;