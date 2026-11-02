from app.openai_services import rag_service


def test_rag_documents_directory_points_to_existing_files_folder():
    assert rag_service.DOCUMENTS_PATH.exists()
    assert rag_service.DOCUMENTS_PATH.name == "rag_files"
