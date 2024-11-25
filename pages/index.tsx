import React from "react";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-5xl font-bold text-blue-500">
          Bem-vindo ao BizzNews
        </h1>
        <p className="text-lg text-gray-700">
          Seu portal de notícias sobre negócios, economia e inovação.
        </p>
        <div className="border-t-2 border-gray-300 w-1/3 mx-auto"></div>
        <h2 className="text-2xl font-medium text-blue-500">
          Estamos em construção 🚧
        </h2>
        <p className="text-gray-600">
          Acompanhe as novidades! Estamos preparando algo incrível para você.
        </p>
      </div>
    </div>
  );
}

export default Home;
